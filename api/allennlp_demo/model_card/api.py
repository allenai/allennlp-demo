"""
The model-card endpoint serves AllenNLP models for pretrained models. The data is served from
a single endpoint so that the latest allennlp_models package can be used. Some modules (like NMN)
include an older version that doesn't include the model card information.
"""
import logging
import flask
from werkzeug.exceptions import NotFound

from allennlp_demo.common.logs import configure_logging
from allennlp_models.pretrained import get_pretrained_models
from allennlp_models.version import VERSION


logger = logging.getLogger(__name__)


class ModelCardService(flask.Flask):
    def __init__(self, name: str = "model-card"):
        super().__init__(name)
        configure_logging(self)

        @self.route("/", methods=["GET"])
        def info():
            return flask.jsonify({"id": "model-cards", "allennlp_models": VERSION})

        @self.route("/<string:model_id>", methods=["GET"])
        def model_card(model_id: str):
            card = get_pretrained_models().get(model_id)
            if card is None:
                raise NotFound(f"No model with id {model_id} found.")
            return flask.jsonify(card.to_dict())


if __name__ == "__main__":
    app = ModelCardService()
    app.run(host="0.0.0.0", port=8000)
