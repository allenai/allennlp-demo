import sys
import os
import json
import logging
# This adds ../ to the PYTHONPATH, so that allennlp_demo imports work.
sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))))

from allennlp.version import VERSION
from allennlp.interpret.saliency_interpreters import SimpleGradient, IntegratedGradient, SmoothGradient
from allennlp.predictors import Predictor
from allennlp.common import JsonDict
from allennlp_demo.common import logs, config
from allennlp_plugins import allennlp_models
from dataclasses import asdict
from functools import lru_cache
from flask import Flask, jsonify, request, after_this_request, Response, Request, abort
from flask.logging import default_handler
from typing import Dict

if __name__ == "__main__":
    app = Flask(__name__)
    logs.init(app)

    model = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
    predictor = Predictor.from_path(model.archive_file, model.predictor_name)

    @app.route("/")
    def info() -> str:
        return jsonify({ **asdict(model), "allennlp": VERSION })

    @lru_cache(maxsize=1024)
    def caching_predict(data: str) -> JsonDict:
        return predictor.predict_json(json.loads(data))

    @app.route("/predict", methods=["POST"])
    def predict_handler() -> JsonDict:
        if "nocache" in request.args:
            return predictor.predict_json(request.get_json())

        # This allows us to determine if the response we're serving was cached. It's safe to
        # do because we use a single-threaded server.
        pre_hits = caching_predict.cache_info().hits
        r = caching_predict(request.data)
        cinfo = caching_predict.cache_info()

        # If it's a cache hit add a HTTP header
        if cinfo.hits - pre_hits == 1:
            @after_this_request
            def add_cache_hit_header(r: Response):
                r.headers["X-Cache-Hit"] = "1"
                return r

        return jsonify(r)

    class UnknownInterpreterError(RuntimeError):
        pass

    def interpret(interpreter: str, data: str) -> JsonDict:
        if interpreter == "simple":
            i = SimpleGradient(predictor)
            return i.saliency_interpret_from_json(json.loads(data))
        elif interpreter == "smooth":
            i = SmoothGradient(predictor)
            return i.saliency_interpret_from_json(json.loads(data))
        elif interpreter == "integrated":
            i = IntegratedGradient(predictor)
            return i.saliency_interpret_from_json(json.loads(data))
        else:
            raise UnknownInterpreterError(f"Unknown Interpreter: {interpreter}")

    @lru_cache(maxsize=1024)
    def caching_interpret(interpreter: str, data: str) -> JsonDict:
        return interpret(interpreter, data)

    @app.route("/interpret/<string:interpreter>", methods=["POST"])
    def interpret_handler(interpreter: str) -> JsonDict:
        try:
            if "nocache" in request.args:
                interpret(interpreter, request.data)

            # This allows us to determine if the response we're serving was cached. It's safe to
            # do because we use a single-threaded server.
            pre_hits = caching_interpret.cache_info().hits
            r = caching_interpret(interpreter, request.data)
            cinfo = caching_interpret.cache_info()

            # If it's a cache hit add a HTTP header
            if cinfo.hits - pre_hits == 1:
                @after_this_request
                def add_cache_hit_header(r: Response):
                    r.headers["X-Cache-Hit"] = "1"
                    return r

            return jsonify(r)
        except UnknownInterpreterError as err:
            abort(400)

    # For simplicity, we use Flask's built in server. This isn't recommended, per:
    # https://flask.palletsprojects.com/en/1.1.x/tutorial/deploy/#run-with-a-production-server
    #
    # That said we think this is preferable because:
    #   - It"s simple. No need to install another WSGI server and add logic for enabling it in
    #     the right context.
    #   - Our workload is CPU bound, so event loop based WSGI servers don't get us much.
    #   - We use Kubernetes to scale horizontally, and run an NGINX proxy at the front-door, which
    #     adds the resiliency and other things we need for production.
    app.run(host="0.0.0.0", port=8000)
