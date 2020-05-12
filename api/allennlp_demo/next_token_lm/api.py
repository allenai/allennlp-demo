import os

from allennlp_models import lm  # noqa: F401

from allennlp_demo.common import config, http


class NextTokenLmModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)


if __name__ == "__main__":
    endpoint = NextTokenLmModelEndpoint()
    endpoint.run()
