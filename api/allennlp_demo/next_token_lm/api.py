import os
from typing import Dict

from allennlp.interpret.attackers import Attacker, Hotflip

from allennlp_demo.common import config, http


class NextTokenLmModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)

    def load_attackers(self) -> Dict[str, Attacker]:
        hotflip = Hotflip(self.predictor, "gpt2")
        hotflip.initialize()
        return {"hotflip": hotflip}


if __name__ == "__main__":
    endpoint = NextTokenLmModelEndpoint()
    endpoint.run()
