import logging
import flask

from typing import Dict

from allennlp_demo.common.logs import configure_logging
from allennlp_models.pretrained import get_pretrained_models


logger = logging.getLogger(__name__)


class ModelCardsService(flask.Flask):
    def __init__(self, name: str = "model-cards"):
        super().__init__(name)
        configure_logging(self)

        # We call this once and cache the results. It takes a little memory (~4 MB) but makes
        # everything a lot faster.
        self.cards_by_id = get_pretrained_models()

        @self.route("/", methods=["GET"])
        def all_model_cards():
            cards: Dict[str, Dict] = {}
            for id, card in self.cards_by_id.items():
                cards[id] = card.to_dict()
            return flask.jsonify(cards)


if __name__ == "__main__":
    app = ModelCardsService()
    app.run(host="0.0.0.0", port=8000)
