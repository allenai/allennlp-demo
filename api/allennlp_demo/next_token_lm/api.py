import os
import re
from typing import Dict, Any

from allennlp.interpret.attackers import Attacker, Hotflip
from allennlp.predictors.predictor import JsonDict
from overrides import overrides

from allennlp_demo.common import config, http


class NextTokenLmModelEndpoint(http.ModelEndpoint):
    # TODO: don't hardcode this.
    _END_OF_TEXT_TOKEN = "<|endoftext|>"

    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
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
        outputs = self.predictor.predict_json(inputs)
        # We also do some final sanitization on the outputs to remove the '<endoftext>' token
        # and filter out any predicted sequences that are empty, i.e. just equal to the
        # '<|endoftext|>' token repeated.
        return self._sanitize_outputs(outputs)

    @staticmethod
    def _sanitize_input_text(sentence: str) -> str:
        return re.sub(r" +", " ", sentence.rstrip(" \t\r"))

    def _sanitize_outputs(self, output: Dict[str, Any]) -> Dict[str, Any]:
        sanitized_top_tokens = []
        sanitized_top_indices = []
        sanitized_probabilities = []
        for tokens, indices, probability in zip(
            output["top_tokens"], output["top_indices"], output["probabilities"]
        ):
            filtered = [(t, i) for (t, i) in zip(tokens, indices) if t != self._END_OF_TEXT_TOKEN]
            if not filtered:
                continue
            new_tokens, new_indices = zip(*filtered)
            sanitized_top_tokens.append(list(new_tokens))
            sanitized_top_indices.append(list(new_indices))
            sanitized_probabilities.append(probability)
        output["top_tokens"] = sanitized_top_tokens
        output["top_indices"] = sanitized_top_indices
        output["probabilities"] = sanitized_probabilities
        return output


if __name__ == "__main__":
    endpoint = NextTokenLmModelEndpoint()
    endpoint.run()
