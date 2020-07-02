import os

from allennlp_demo.common import config, http
from allennlp_models import tagging  # noqa: F401

class FineGrainedNerModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        # TODO: should just import the exact submodule we need.
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)


if __name__ == "__main__":
    endpoint = FineGrainedNerModelEndpoint()
    endpoint.run()
