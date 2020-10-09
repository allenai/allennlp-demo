import os

from allennlp.common.util import JsonDict

from allennlp_demo.common import config, http


class TransformerQaModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)

    def predict(self, inputs: JsonDict):
        # For compatability with other RC models.
        if "passage" in inputs:
            inputs["context"] = inputs.pop("passage")
        return super().predict(inputs)

    def load_interpreters(self):
        # The interpreters don't work with this model right now.
        return {}

    def load_attackers(self):
        # The attackers don't work with this model right now.
        return {}


if __name__ == "__main__":
    endpoint = TransformerQaModelEndpoint()
    endpoint.run()
