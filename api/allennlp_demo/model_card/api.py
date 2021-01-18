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

        self.cards_by_id = get_pretrained_models()

        @self.route("/", methods=["GET"])
        def info():
            return flask.jsonify({"id": "model-card", "allennlp_models": VERSION})

        @self.route("/<string:model_id>", methods=["GET"])
        def model_card(model_id: str):
            """
            Returns the model card for a model. Multiple model cards can be requested at once
            by passing several model ids, comma delimited.
            """
            cards = []
            model_ids = model_id.split(",")
            for model_id in model_ids:
                card = self.cards_by_id.get(model_id)
                if card is None:
                    raise NotFound(f"No model with id {model_id} found.")
                cards.append(card)
            if len(cards) == 1:
                return flask.jsonify(cards.pop().to_dict())
            return flask.jsonify([c.to_dict() for c in cards])


if __name__ == "__main__":
    app = ModelCardService()
    app.run(host="0.0.0.0", port=8000)
