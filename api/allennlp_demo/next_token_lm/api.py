import os
import re
from typing import Dict

from allennlp.interpret.attackers import Attacker, Hotflip
from allennlp.predictors.predictor import JsonDict
from overrides import overrides

from allennlp_demo.common import config, http


class NextTokenLmModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(
            os.path.join(os.path.dirname(__file__), "model.json")
        )
        super().__init__(c)

    @overrides
    def load_attackers(self) -> Dict[str, Attacker]:
        hotflip = Hotflip(self.predictor, "gpt2")
        hotflip.initialize()
        return {"hotflip": hotflip}

    @overrides
    def predict(self, inputs: JsonDict) -> JsonDict:
        # We override this to do a little extra sanitization on the inputs.
        # In particular, we strip any trailing whitespace (except for newlines,
        # which are most likely intentional) and remove any double spaces, since
        # these things result in poor predictions.
        inputs["sentence"] = self._sanitize_input_text(inputs["sentence"])
        return self.predictor.predict_json(inputs)

    @staticmethod
    def _sanitize_input_text(sentence: str) -> str:
        return re.sub(r" +", " ", sentence.rstrip(" \t\r"))


if __name__ == "__main__":
    endpoint = NextTokenLmModelEndpoint()
    endpoint.run()
