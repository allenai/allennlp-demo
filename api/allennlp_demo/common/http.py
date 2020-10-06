from functools import lru_cache
from dataclasses import asdict
import json

from flask import Flask, Request, Response, after_this_request, request, jsonify
from typing import Callable, Mapping
from allennlp.version import VERSION
from allennlp_demo.common import config
from allennlp_demo.common.logs import configure_logging
from allennlp.predictors.predictor import Predictor, JsonDict
from allennlp.interpret.saliency_interpreters import (
    SaliencyInterpreter,
    SimpleGradient,
    SmoothGradient,
    IntegratedGradient,
)
from allennlp.interpret.attackers import Attacker, Hotflip, InputReduction


def no_cache(request: Request) -> bool:
    """
    Returns True if the "no_cache" query string argument is present in the provided request.

    This provides a consistent mechanism across all endpoints for disabling the cache.
    """
    return "no_cache" in request.args


def with_cache_hit_response_headers(fn: Callable, *args):
    """
    Calls the provided function with the given arguments and returns the results. If the results
    are produced by a cache a HTTP header is added to the response.

    The provided function must be memoized using the functools.lru_cache decorator.
    """
    # This allows us to determine if the response we're serving was cached. It's safe to
    # do because we use a single-threaded server.
    pre_hits = fn.cache_info().hits  # type: ignore
    r = fn(*args)

    # If it was a cache hit add a HTTP header to the response
    if fn.cache_info().hits - pre_hits == 1:  # type: ignore

        @after_this_request
        def add_header(resp: Response) -> Response:
            resp.headers["X-Cache-Hit"] = "1"
            return resp

    return r


class NotFoundError(RuntimeError):
    pass


class UnknownInterpreterError(NotFoundError):
    def __init__(self, interpreter_id: str):
        super().__init__(f"No interpreter with id {interpreter_id}")


class UnknownAttackerError(NotFoundError):
    def __init__(self, attacker_id: str):
        super().__init__(f"No attacker with id {attacker_id}")


class ModelEndpoint:
    """
    Class capturing a single model endpoint which provides a HTTP API suitable for use by
    the AllenNLP demo.

    This class can be extended to implement custom functionality.
    """

    def __init__(self, model: config.Model):
        self.model = model
        self.app = Flask(model.id)
        self.configure_logging()

        if model.pretrained_model_id is not None:
            # This is here so that this will also work with older versions.
            # TODO (epwalsh): import this at the top once we move ALL demo models
            # to new version of allennlp/allennlp-models.
            from allennlp_models.pretrained import load_predictor

            self.predictor = load_predictor(model.pretrained_model_id)
        elif model.archive_file is not None:
            o = json.dumps(model.overrides) if model.overrides is not None else ""
            self.predictor = Predictor.from_path(
                model.archive_file, predictor_name=model.predictor_name, overrides=o
            )
        else:
            raise ValueError(
                "invalid model config, either 'pretrained_model_id' or 'archive_file' required"
            )

        self.interpreters = self.load_interpreters()
        self.attackers = self.load_attackers()

        self.configure_error_handling()

        # By creating the LRU caches when the class is instantiated, we can
        # be sure that the caches are specific to the instance, and not the class,
        # i.e. every instance will have its own set of caches.

        @lru_cache(maxsize=1024)
        def predict_with_cache(inputs: str) -> JsonDict:
            return self.predict(json.loads(inputs))

        @lru_cache(maxsize=1024)
        def interpret_with_cache(interpreter_id: str, inputs: str) -> JsonDict:
            return self.interpret(interpreter_id, json.loads(inputs))

        @lru_cache(maxsize=1024)
        def attack_with_cache(attacker_id: str, attack: str) -> JsonDict:
            return self.attack(attacker_id, json.loads(attack))

        self.predict_with_cache = predict_with_cache
        self.interpret_with_cache = interpret_with_cache
        self.attack_with_cache = attack_with_cache

        self.setup_routes()

    def load_interpreters(self) -> Mapping[str, SaliencyInterpreter]:
        """
        Returns a mapping of interpreters keyed by a unique identifier. Requests to
        `/interpret/:id` will invoke the interpreter with the provided `:id`. Override this method
        to add or remove interpreters.
        """
        return {
            "simple_gradient": SimpleGradient(self.predictor),
            "smooth_gradient": SmoothGradient(self.predictor),
            "integrated_gradient": IntegratedGradient(self.predictor),
        }

    def load_attackers(self) -> Mapping[str, Attacker]:
        """
        Returns a mapping of attackers keyed by a unique identifier. Requests to `/attack/:id`
        will invoke the attacker with the provided `:id`. Override this method to add or remove
        attackers.
        """
        hotflip = Hotflip(self.predictor)
        hotflip.initialize()
        return {"hotflip": hotflip, "input_reduction": InputReduction(self.predictor)}

    def info(self) -> str:
        """
        Returns basic information about the model and the version of AllenNLP.
        """
        return jsonify({**asdict(self.model), "allennlp": VERSION})

    def predict(self, inputs: JsonDict) -> JsonDict:
        """
        Returns predictions.
        """
        return self.predictor.predict_json(inputs)

    def interpret(self, interpreter_id: str, inputs: JsonDict) -> JsonDict:
        """
        Interprets the output of a predictor and assigns sailency scores to each, as to find
        inputs that would change the model's prediction some desired manner.
        """
        interp = self.interpreters.get(interpreter_id)
        if interp is None:
            raise UnknownInterpreterError(interpreter_id)
        return interp.saliency_interpret_from_json(inputs)

    def attack(self, attacker_id: str, attack: JsonDict) -> JsonDict:
        """
        Modifies the input (e.g. by adding or removing tokens) to try to change the model's prediction
        in some desired manner.
        """
        attacker = self.attackers.get(attacker_id)
        if attacker is None:
            raise UnknownAttackerError(attacker_id)
        return attacker.attack_from_json(**attack)

    def configure_logging(self) -> None:
        configure_logging(self.app)

    def configure_error_handling(self) -> None:
        def handle_invalid_json(err: json.JSONDecodeError):
            return jsonify({"error": str(err)}), 400

        self.app.register_error_handler(json.JSONDecodeError, handle_invalid_json)

        def handle_404(err: NotFoundError):
            return jsonify({"error": str(err)}), 404

        self.app.register_error_handler(NotFoundError, handle_404)

    def setup_routes(self) -> None:
        """
        Binds HTTP paths to verbs supported by a standard model endpoint. You can override this
        method to define additional routes or change the default ones.
        """

        @self.app.route("/")
        def info_handler():
            return self.info()

        @self.app.route("/predict", methods=["POST"])
        def predict_handler():
            if no_cache(request):
                return jsonify(self.predict(request.get_json()))
            return jsonify(with_cache_hit_response_headers(self.predict_with_cache, request.data))

        @self.app.route("/interpret/<string:interpreter_id>", methods=["POST"])
        def interpet_handler(interpreter_id: str):
            if no_cache(request):
                return jsonify(self.interpret(interpreter_id, request.get_json()))
            return jsonify(
                with_cache_hit_response_headers(
                    self.interpret_with_cache, interpreter_id, request.data
                )
            )

        @self.app.route("/attack/<string:attacker_id>", methods=["POST"])
        def attack_handler(attacker_id: str):
            if no_cache(request):
                return jsonify(self.attack(attacker_id, request.get_json()))
            return jsonify(
                with_cache_hit_response_headers(self.attack_with_cache, attacker_id, request.data)
            )

    def run(self, port: int = 8000) -> None:
        # For simplicity, we use Flask's built in server. This isn't recommended, per:
        # https://flask.palletsprojects.com/en/1.1.x/tutorial/deploy/#run-with-a-production-server
        #
        # That said we think this is preferable because:
        #   - It's simple. No need to install another WSGI server and add logic for enabling it in
        #     the right context.
        #   - Our workload is CPU bound, so event loop based WSGI servers don't get us much.
        #   - We use Kubernetes to scale horizontally, and run an NGINX proxy at the front-door,
        #     which adds the resiliency and other things we need for production.
        self.app.run(host="0.0.0.0", port=port)
