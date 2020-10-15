import os

import tempfile
from base64 import standard_b64decode

from allennlp.common.util import JsonDict

from allennlp_demo.common import config, http


class VilbertVqaModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)

    def predict(self, inputs: JsonDict):
        result = None

        image_url = inputs.get("image_url")
        if image_url is not None:
            result = super().predict({"question": inputs["question"], "image": image_url})
        else:
            image = inputs.get("image")
            if image is not None:
                image_base64 = image["image_base64"]
                if image_base64 is not None:
                    with tempfile.NamedTemporaryFile(prefix=f"{self.__class__.__name__}-") as f:
                        f.write(standard_b64decode(image_base64))
                        f.flush()
                        result = super().predict({"question": inputs["question"], "image": f.name})

        if result is None:
            raise ValueError("No image found in request.")

        results = [
            {"answer": token, "confidence": score * 100}
            for token, score in result["tokens"].items()
            if not token.startswith("@@")
        ]
        results.sort(key=lambda x: -x["confidence"])
        return results[:45]  # Jon only wants the first 45 results.

    def load_interpreters(self):
        # The interpreters don't work with this model right now.
        return {}

    def load_attackers(self):
        # The attackers don't work with this model right now.
        return {}


if __name__ == "__main__":
    endpoint = VilbertVqaModelEndpoint()
    endpoint.run()
