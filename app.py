#!/usr/bin/env python

"""
A `Flask <http://flask.pocoo.org/>`_ server that serves up our demo.
"""
from datetime import datetime
from typing import Dict, Optional, List
import argparse
import json
import logging
import os
import sys
import time
from functools import lru_cache

from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
from gevent.pywsgi import WSGIServer
from werkzeug.contrib.fixers import ProxyFix

import psycopg2

import pytz

from allennlp.common.util import JsonDict, peak_memory_mb
from allennlp.predictors import Predictor

from server.permalinks import int_to_slug, slug_to_int
from server.db import DemoDatabase, PostgresDemoDatabase
from server.models import DemoModel, load_demo_models



logging.basicConfig(level=logging.INFO)
logging.getLogger("allennlp").setLevel(logging.WARN)
logger = logging.getLogger(__name__)  # pylint: disable=invalid-name

if "SENTRY_PYTHON_AUTH" in os.environ:
    logger.info("Enabling Sentry since SENTRY_PYTHON_AUTH is defined.")
    import sentry_sdk
    sentry_sdk.init(os.environ.get("SENTRY_PYTHON_AUTH"))

class ServerError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        logger.error(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        error_dict = dict(self.payload or ())
        error_dict['message'] = self.message
        return error_dict

def main(demo_dir: str,
         port: int,
         cache_size: int,
         models: Dict[str, DemoModel]) -> None:
    """Run the server programatically"""
    logger.info("Starting a flask server on port %i.", port)

    if port != 8000:
        logger.warning("The demo requires the API to be run on port 8000.")

    # This will be ``None`` if all the relevant environment variables are not defined or if
    # there is an exception when connecting to the database.
    demo_db = PostgresDemoDatabase.from_environment()
    if demo_db is None:
        logger.warning("demo db credentials not provided, so not using demo db")

    app = make_app(build_dir=f"{demo_dir}/build", demo_db=demo_db, models=models)
    CORS(app)

    http_server = WSGIServer(('0.0.0.0', port), app, log=logger, error_log=logger)
    logger.info("Server started on port %i.  Please visit: http://localhost:%i", port, port)
    http_server.serve_forever()


def make_app(build_dir: str = None,
             demo_db: Optional[DemoDatabase] = None,
             models: Dict[str, DemoModel] = None,
             cache_size: int = 128) -> Flask:
    if models is None:
        models = {}

    if not os.path.exists(build_dir):
        logger.error("app directory %s does not exist, aborting", build_dir)
        sys.exit(-1)

    app = Flask(__name__)  # pylint: disable=invalid-name
    start_time = datetime.now(pytz.utc)
    start_time_str = start_time.strftime("%Y-%m-%d %H:%M:%S %Z")

    app.predictors = {}
    app.max_request_lengths = {}
    app.wsgi_app = ProxyFix(app.wsgi_app) # sets the requester IP with the X-Forwarded-For header

    for name, demo_model in models.items():
        logger.info(f"loading {name} model")
        predictor = demo_model.predictor()
        app.predictors[name] = predictor
        app.max_request_lengths[name] = demo_model.max_request_length

    @app.errorhandler(ServerError)
    def handle_invalid_usage(error: ServerError) -> Response:  # pylint: disable=unused-variable
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @lru_cache(maxsize=cache_size)
    def _caching_prediction(model: Predictor, data: str) -> JsonDict:
        """
        Just a wrapper around ``model.predict_json`` that allows us to use a cache decorator.
        """
        return model.predict_json(json.loads(data))

    @app.route('/')
    def index() -> Response: # pylint: disable=unused-variable
        return send_file(os.path.join(build_dir, 'index.html'))

    @app.route('/permadata', methods=['POST', 'OPTIONS'])
    def permadata() -> Response:  # pylint: disable=unused-variable
        """
        If the user requests a permalink, the front end will POST here with the payload
            { slug: slug }
        which we convert to an integer id and use to retrieve saved results from the database.
        """
        # This is just CORS boilerplate.
        if request.method == "OPTIONS":
            return Response(response="", status=200)

        # If we don't have a database configured, there are no permalinks.
        if demo_db is None:
            raise ServerError('Permalinks are not enabled', 400)

        # Convert the provided slug to an integer id.
        slug = request.get_json()["slug"]
        perma_id = slug_to_int(slug)
        if perma_id is None:
            # Malformed slug
            raise ServerError("Unrecognized permalink: {}".format(slug), 400)

        # Fetch the results from the database.
        try:
            permadata = demo_db.get_result(perma_id)
        except psycopg2.Error:
            logger.exception("Unable to get results from database: perma_id %s", perma_id)
            raise ServerError('Database trouble', 500)

        if permadata is None:
            # No data found, invalid id?
            raise ServerError("Unrecognized permalink: {}".format(slug), 400)

        return jsonify({
                "modelName": permadata.model_name,
                "requestData": permadata.request_data,
                "responseData": permadata.response_data
        })

    @app.route('/predict/<model_name>', methods=['POST', 'OPTIONS'])
    def predict(model_name: str) -> Response:  # pylint: disable=unused-variable
        """make a prediction using the specified model and return the results"""
        if request.method == "OPTIONS":
            return Response(response="", status=200)

        # Do log if no argument is specified
        record_to_database = request.args.get("record", "true").lower() != "false"

        # Do use the cache if no argument is specified
        use_cache = request.args.get("cache", "true").lower() != "false"

        lowered_model_name = model_name.lower()
        model = app.predictors.get(lowered_model_name)
        if model is None:
            raise ServerError("unknown model: {}".format(model_name), status_code=400)
        max_request_length = app.max_request_lengths[lowered_model_name]

        data = request.get_json()

        serialized_request = json.dumps(data)
        if len(serialized_request) > max_request_length:
            raise ServerError(f"Max request length exceeded for model {model_name}! " +
                              f"Max: {max_request_length} Actual: {len(serialized_request)}")

        logger.info("request: %s", json.dumps({"model": model_name, "inputs": data}))

        log_blob = {"model": model_name, "inputs": data, "cached": False, "outputs": {}}

        # Record the number of cache hits before we hit the cache so we can tell whether we hit or not.
        # In theory this could result in false positives.
        pre_hits = _caching_prediction.cache_info().hits  # pylint: disable=no-value-for-parameter

        if record_to_database and demo_db is not None:
            try:
                perma_id = None
                perma_id = demo_db.insert_request(headers=dict(request.headers),
                                                  requester=request.remote_addr,
                                                  model_name=model_name,
                                                  inputs=data)

            except Exception:  # pylint: disable=broad-except
                # TODO(joelgrus): catch more specific errors
                logger.exception("Unable to add request to database", exc_info=True)

        if use_cache and cache_size > 0:
            # lru_cache insists that all function arguments be hashable,
            # so unfortunately we have to stringify the data.
            prediction = _caching_prediction(model, json.dumps(data))
        else:
            # if cache_size is 0, skip caching altogether
            prediction = model.predict_json(data)

        post_hits = _caching_prediction.cache_info().hits  # pylint: disable=no-value-for-parameter

        if record_to_database and demo_db is not None and perma_id is not None:
            try:
                demo_db.update_response(perma_id=perma_id, outputs=prediction)
                slug = int_to_slug(perma_id)
                prediction["slug"] = slug
                log_blob["slug"] = slug

            except Exception:  # pylint: disable=broad-except
                # TODO(joelgrus): catch more specific errors
                logger.exception("Unable to add response to database", exc_info=True)

        if use_cache and post_hits > pre_hits:
            # Cache hit, so insert an artifical pause
            log_blob["cached"] = True
            time.sleep(0.25)

        # The model predictions are extremely verbose, so we only log the most human-readable
        # parts of them.
        if "comprehension" in model_name:
            if 'best_span_str' in prediction:
                answer = prediction['best_span_str']
            else:
                answer = prediction['answer']
            log_blob["outputs"]["answer"] = answer
        elif model_name == "coreference-resolution":
            log_blob["outputs"]["clusters"] = prediction["clusters"]
            log_blob["outputs"]["document"] = prediction["document"]
        elif model_name == "textual-entailment":
            log_blob["outputs"]["label_probs"] = prediction["label_probs"]
        elif model_name == "named-entity-recognition":
            log_blob["outputs"]["tags"] = prediction["tags"]
        elif model_name == "semantic-role-labeling":
            verbs = []
            for verb in prediction["verbs"]:
                # Don't want to log boring verbs with no semantic parses.
                good_tags = [tag for tag in verb["tags"] if tag != "0"]
                if len(good_tags) > 1:
                    verbs.append({"verb": verb["verb"], "description": verb["description"]})
            log_blob["outputs"]["verbs"] = verbs

        elif model_name == "constituency-parsing":
            log_blob["outputs"]["trees"] = prediction["trees"]
        elif model_name == "wikitables-parser":
             log_blob['outputs']['logical_form'] = prediction['logical_form']
             log_blob['outputs']['answer'] = prediction['answer']
        elif model_name == "quarel-parser-zero":
             log_blob['outputs']['logical_form'] = prediction['logical_form']
             log_blob['outputs']['answer'] = prediction['answer']
             log_blob['outputs']['score'] = prediction['score']
        elif model_name == "nlvr-parser":
             log_blob['outputs']['logical_form'] = prediction['logical_form'][0]
             log_blob['outputs']['answer'] = prediction['denotations'][0][0]
        elif model_name == "atis-parser":
            log_blob['outputs']['predicted_sql_query'] = prediction['predicted_sql_query']
        # TODO(brendanr): Add event2mind log_blob here?

        logger.info("prediction: %s", json.dumps(log_blob))

        return jsonify(prediction)

    @app.route('/models')
    def list_models() -> Response:  # pylint: disable=unused-variable
        """list the available models"""
        return jsonify({"models": list(app.predictors.keys())})

    @app.route('/info')
    def info() -> Response:  # pylint: disable=unused-variable
        """List metadata about the running webserver"""
        uptime = str(datetime.now(pytz.utc) - start_time)
        git_version = os.environ.get('ALLENNLP_DEMO_SOURCE_COMMIT') or ""
        return jsonify({
                "start_time": start_time_str,
                "uptime": uptime,
                "git_version": git_version,
                "peak_memory_mb": peak_memory_mb(),
                "githubUrl": "http://github.com/allenai/allennlp-demo/commit/" + git_version})

    # As an SPA, we need to return index.html for /model-name and /model-name/permalink,
    def return_page(permalink: str = None) -> Response:  # pylint: disable=unused-argument, unused-variable
        """return the page"""
        return app.send_static_file('index.html')

    for model_name in models:
        app.add_url_rule(f"/{model_name}", view_func=return_page)
        app.add_url_rule(f"/{model_name}/<permalink>", view_func=return_page)

    @app.route('/<path:path>')
    def static_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(build_dir, path)

    @app.route('/static/js/<path:path>')
    def static_js_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(os.path.join(build_dir, 'static/js'), path)

    @app.route('/static/css/<path:path>')
    def static_css_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(os.path.join(build_dir, 'static/css'), path)

    return app

if __name__ == "__main__":
    parser = argparse.ArgumentParser("start the allennlp demo")
    parser.add_argument('--port', type=int, default=8000, help='port to serve the demo on')
    parser.add_argument('--demo-dir', type=str, default='demo/', help="directory where the demo HTML is located")
    parser.add_argument('--cache-size', type=int, default=128, help="how many results to keep in memory")
    parser.add_argument('--models-file', type=str, default='models.json', help="json file containing the details of the models to load")

    models_group = parser.add_mutually_exclusive_group()
    models_group.add_argument('--model', type=str, action='append', default=[], help='if specified, only load these models')
    models_group.add_argument('--no-models', dest='no_models', action='store_true', help='start just the front-end with no models')

    args = parser.parse_args()

    if args.no_models:
        # Don't load any models
        logger.info("starting the front-end with no models loaded")
        models = {}
    else:
        logger.info("loading models")
        models = load_demo_models(args.models_file, args.model)

    main(demo_dir=args.demo_dir,
         port=args.port,
         cache_size=args.cache_size,
         models=models)
