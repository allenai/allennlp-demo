import os
from typing import Mapping

from allennlp.interpret.attackers import Attacker, Hotflip

from allennlp_demo.common import config, http


class MaskedLmModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)

    def load_attackers(self) -> Mapping[str, Attacker]:
        hotflip = Hotflip(self.predictor, "bert")
        hotflip.initialize()
        return {"hotflip": hotflip}


if __name__ == "__main__":
    endpoint = MaskedLmModelEndpoint()
    endpoint.run()
