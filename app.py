#!/usr/bin/env python

"""
A `Flask <http://flask.pocoo.org/>`_ server that serves up our demo.
"""
from datetime import datetime
from typing import Dict, Optional, List, Iterable
import argparse
import json
import logging
import os
import sys
import time
from functools import lru_cache
from collections import defaultdict

from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
from gevent.pywsgi import WSGIServer
from werkzeug.contrib.fixers import ProxyFix

import psycopg2

import pytz

from allennlp.common.util import JsonDict, peak_memory_mb
from allennlp.predictors import Predictor
from allennlp.interpret.saliency_interpreters import SaliencyInterpreter, SimpleGradient, IntegratedGradient, SmoothGradient
from allennlp.interpret.attackers import Attacker, InputReduction, Hotflip 

from server.permalinks import int_to_slug, slug_to_int
from server.db import DemoDatabase, PostgresDemoDatabase
from server.logging import StackdriverJsonFormatter
from server.utils import with_no_cache_headers
from server.demo_model import DemoModel
from server.models import load_demo_models


logging.getLogger("allennlp").setLevel(logging.WARN)
logger = logging.getLogger(__name__)  # pylint: disable=invalid-name
logger.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(StackdriverJsonFormatter())
handler.setLevel(logging.INFO)
logger.addHandler(handler)
logger.propagate = False

supported_interpret_models = {'named-entity-recognition',
                              'fine-grained-named-entity-recognition',
                              'sentiment-analysis',
                              'textual-entailment',
                              'reading-comprehension',
                              'elmo-reading-comprehension',
                              'naqanet-reading-comprehension',
                              'masked-lm',
                              'next-token-lm'}


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
         interpret_cache_size: int,
         attack_cache_size: int,
         models: Dict[str, DemoModel]) -> None:
    """Run the server programmatically"""
    logger.info("Starting a flask server on port %i.", port)

    logger.info(f"With models {models}")

    if port != 8000:
        logger.warning("The demo requires the API to be run on port 8000.")

    # This will be ``None`` if all the relevant environment variables are not defined or if
    # there is an exception when connecting to the database.
    demo_db = PostgresDemoDatabase.from_environment()
    if demo_db is None:
        logger.warning("database credentials not provided, so not using database (permalinks disabled)")

    app = make_app(build_dir=f"{demo_dir}/build", demo_db=demo_db, models=models)
    CORS(app)

    http_server = WSGIServer(('0.0.0.0', port), app, log=logger, error_log=logger)

    logger.info("Server started on port %i.  Please visit: http://localhost:%i", port, port)
    http_server.serve_forever()


def make_app(build_dir: str,
             models: Dict[str, DemoModel],
             demo_db: Optional[DemoDatabase] = None,
             cache_size: int = 128,
             interpret_cache_size: int = 500,
             attack_cache_size: int = 500) -> Flask:
    if not os.path.exists(build_dir):
        logger.error("app directory %s does not exist, aborting", build_dir)
        sys.exit(-1)

    app = Flask(__name__)  # pylint: disable=invalid-name
    start_time = datetime.now(pytz.utc)
    start_time_str = start_time.strftime("%Y-%m-%d %H:%M:%S %Z")

    app.predictors = {}
    app.max_request_lengths = {} # requests longer than these will be rejected to prevent OOME
    app.attackers = defaultdict(dict)
    app.interpreters = defaultdict(dict)
    app.wsgi_app = ProxyFix(app.wsgi_app) # sets the requester IP with the X-Forwarded-For header

    for name, demo_model in models.items():
        if demo_model is not None:
            logger.info(f"loading {name} model")
            predictor = demo_model.predictor()
            app.predictors[name] = predictor
            app.max_request_lengths[name] = demo_model.max_request_length

            if name in supported_interpret_models:
                app.interpreters[name]['simple_gradient'] = SimpleGradient(predictor)
                app.interpreters[name]['integrated_gradient'] = IntegratedGradient(predictor)
                app.interpreters[name]['smooth_gradient'] = SmoothGradient(predictor)
                app.attackers[name]["input_reduction"] = InputReduction(predictor)
                if name == 'masked-lm':
                    app.attackers[name]["hotflip"] = Hotflip(predictor, 'bert')
                elif name == "next-token-lm":
                    app.attackers[name]["hotflip"] = Hotflip(predictor, 'gpt2')
                elif 'named-entity-recognition' in name:
                    # We haven't implemented hotflip for NER.
                    continue
                elif name == 'textual-entailment':
                    # The SNLI model only has ELMo embeddings, which don't work with hotflip on
                    # their own.
                    continue
                else:
                    app.attackers[name]["hotflip"] = Hotflip(predictor)
                    app.attackers[name]["hotflip"].initialize()

    # Disable caching for HTML documents and API responses so that clients
    # always talk to the source (this server).
    @app.after_request
    def set_cache_headers(resp: Response) -> Response:
        if resp.mimetype == "text/html" or resp.mimetype == "application/json":
            return with_no_cache_headers(resp)
        else:
            return resp

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
        
    @lru_cache(maxsize=interpret_cache_size)
    def _caching_interpret(interpreter: SaliencyInterpreter, data: str) -> JsonDict:
        """
        Just a wrapper around ``model.interpret_from_json`` that allows us to use a cache decorator.
        """
        return interpreter.saliency_interpret_from_json(json.loads(data))

    @lru_cache(maxsize=attack_cache_size)
    def _caching_attack(attacker: Attacker, data: str, input_field_to_attack: str, grad_input_field: str, target: str) -> JsonDict:
        """
        Just a wrapper around ``model.attack_from_json`` that allows us to use a cache decorator.
        """
        return attacker.attack_from_json(inputs=json.loads(data),
                                         input_field_to_attack=input_field_to_attack,
                                         grad_input_field=grad_input_field,
                                         target=json.loads(target))
    
    @app.route('/')
    def index() -> Response: # pylint: disable=unused-variable
        return send_file(os.path.join(build_dir, 'index.html'))

    @app.route('/permadata/<model_name>', methods=['POST', 'OPTIONS'])
    def permadata(model_name: str) -> Response:  # pylint: disable=unused-variable
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
        elif model_name == "sentiment-analysis":
            log_blob["outputs"]["probs"] = prediction["probs"]
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
        elif model_name == "nlvr-parser":
             log_blob['outputs']['logical_form'] = prediction['logical_form'][0]
             log_blob['outputs']['answer'] = prediction['denotations'][0][0]
        elif model_name == "atis-parser":
            log_blob['outputs']['predicted_sql_query'] = prediction['predicted_sql_query']
        # TODO(brendanr): Add event2mind log_blob here?

        logger.info("prediction: %s", json.dumps(log_blob))

        return jsonify(prediction)

    @app.route('/attack/<model_name>', methods=['POST','OPTIONS'])
    def attack(model_name: str) -> Response:
        """
        Modify input to change prediction of model
        """
        if request.method == "OPTIONS":
            return Response(response="", status=200)
        
        # Do use the cache if no argument is specified
        use_cache = request.args.get("cache", "true").lower() != "false"

        lowered_model_name = model_name.lower()

        data = request.get_json()
        attacker_name = data.pop("attacker")
        input_field_to_attack = data.pop("inputToAttack")
        grad_input_field = data.pop("gradInput")
        target = data.pop("target", None)

        model_attackers = app.attackers.get(lowered_model_name)
        if model_attackers is None:
            raise ServerError("unknown model: {}".format(model_name), status_code=400)
        attacker = model_attackers.get(attacker_name)
        if attacker is None:
            raise ServerError("unknown attacker for model: {} {}".format(attacker_name, model_name), status_code=400)

        max_request_length = app.max_request_lengths[lowered_model_name]
        serialized_request = json.dumps(data)
        if len(serialized_request) > max_request_length:
            raise ServerError(f"Max request length exceeded for model {model_name}! " +
                              f"Max: {max_request_length} Actual: {len(serialized_request)}")
        
        pre_hits = _caching_attack.cache_info().hits  # pylint: disable=no-value-for-parameter

        if use_cache and attack_cache_size > 0:
            # lru_cache insists that all function arguments be hashable,
            # so unfortunately we have to stringify the data.
            attack = _caching_attack(attacker, json.dumps(data), input_field_to_attack, grad_input_field, json.dumps(target))
            
        else:
            # if cache_size is 0, skip caching altogether
            attack = attacker.attack_from_json(inputs=data,
                                               input_field_to_attack=input_field_to_attack,
                                               grad_input_field=grad_input_field,
                                               target=target)

        post_hits = _caching_attack.cache_info().hits  # pylint: disable=no-value-for-parameter
        
        if use_cache and post_hits > pre_hits:
            # Cache hit, so insert an artifical pause
            time.sleep(0.25)

        return jsonify(attack)

    @app.route('/interpret/<model_name>', methods=['POST', 'OPTIONS'])
    def interpret(model_name: str) -> Response:
        """
        Interpret prediction of the model
        """
        if request.method == "OPTIONS":
            return Response(response="", status=200)

        # Do use the cache if no argument is specified
        use_cache = request.args.get("cache", "true").lower() != "false"

        lowered_model_name = model_name.lower()
    
        data = request.get_json()
        interpreter_name = data.pop("interpreter")

        model_interpreters = app.interpreters.get(lowered_model_name)
        if model_interpreters is None:
            raise ServerError("no interpreters for model: {}".format(model_name), status_code=400)
        interpreter = model_interpreters.get(interpreter_name)
        if interpreter is None:
            raise ServerError("unknown interpreter for model: {} {}".format(interpreter_name, model_name), status_code=400)

        max_request_length = app.max_request_lengths[lowered_model_name]

        serialized_request = json.dumps(data)
        if len(serialized_request) > max_request_length:
            raise ServerError(f"Max request length exceeded for interpreter {model_name}! " +
                              f"Max: {max_request_length} Actual: {len(serialized_request)}")

        pre_hits = _caching_interpret.cache_info().hits  # pylint: disable=no-value-for-parameter

        if use_cache and interpret_cache_size > 0:
            # lru_cache insists that all function arguments be hashable,
            # so unfortunately we have to stringify the data.
            interpretation = _caching_interpret(interpreter, json.dumps(data))
        else:
            # if cache_size is 0, skip caching altogether
            interpretation = interpreter.saliency_interpret_from_json(data)

        post_hits = _caching_prediction.cache_info().hits  # pylint: disable=no-value-for-parameter
        
        if use_cache and post_hits > pre_hits:
            # Cache hit, so insert an artifical pause
            time.sleep(0.25)
            
        return jsonify(interpretation)

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

    @app.route('/health')
    def health() -> Response:  # pylint: disable=unused-variable
        return "healthy"


  # As an SPA, we need to return index.html for /model-name and /model-name/permalink
    def return_page(permalink: str = None) -> Response:  # pylint: disable=unused-argument, unused-variable
        """return the page"""
        return send_file(os.path.join(build_dir, 'index.html'))

    for model_name in models:
        logger.info(f"setting up default routes for {model_name}")
        app.add_url_rule(f"/{model_name}", view_func=return_page)
        app.add_url_rule(f"/{model_name}/<permalink>", view_func=return_page)


    @app.route('/', defaults={ 'path': '' })
    @app.route('/<path:path>')
    def static_proxy(path: str) -> Response: # pylint: disable=unused-variable
        if os.path.isfile(os.path.join(build_dir, path)):
            return send_from_directory(build_dir, path)
        else:
            # Send the index.html page back to the client as a catch-all, since
            # we're an SPA and JavaScript acts to handle routes the server
            # doesn't.
            return send_file(os.path.join(build_dir, 'index.html'))

    @app.route('/static/js/<path:path>')
    def static_js_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(os.path.join(build_dir, 'static/js'), path)

    @app.route('/static/css/<path:path>')
    def static_css_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(os.path.join(build_dir, 'static/css'), path)

    @app.route('/static/media/<path:path>')
    def static_media_proxy(path: str) -> Response: # pylint: disable=unused-variable
        return send_from_directory(os.path.join(build_dir, 'static/media'), path)

    return app

if __name__ == "__main__":
    parser = argparse.ArgumentParser("start the allennlp demo")
    parser.add_argument('--port', type=int, default=8000, help='port to serve the demo on')
    parser.add_argument('--demo-dir', type=str, default='demo/', help="directory where the demo HTML is located")
    parser.add_argument('--cache-size', type=int, default=128, help="how many results to keep in memory")
    parser.add_argument('--interpret-cache-size', type=int, default=500, help="how many interpretation results to keep in memory")
    parser.add_argument('--attack-cache-size', type=int, default=500, help="how many attack results to keep in memory")
    parser.add_argument('--models-file', type=str, default='models.json', help="json file containing the details of the models to load")

    models_group = parser.add_mutually_exclusive_group()
    models_group.add_argument('--model', type=str, action='append', default=[], help='if specified, only load these models')
    models_group.add_argument('--no-models', dest='no_models', action='store_true', help='start just the front-end with no models')

    args = parser.parse_args()

    models = load_demo_models(args.models_file, args.model, model_names_only=args.no_models)

    main(demo_dir=args.demo_dir,
         port=args.port,
         cache_size=args.cache_size,
         interpret_cache_size=args.interpret_cache_size,
         attack_cache_size=args.attack_cache_size,
         models=models)
