import os
from typing import Mapping

from allennlp.common.util import import_module_and_submodules

from allennlp_demo.common import config, http


class NMNDropModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        # TODO: only import the exact submodules we need.
        import_module_and_submodules("semqa")
        import_module_and_submodules("allennlp_models")
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)

    # The demo doesn't use the attack endpoints, so they're disabled for now.
    def load_attackers(self) -> Mapping:
        return {}

    # The same goes for the interpret endpoints.
    def load_interpreters(self) -> Mapping:
        return {}


if __name__ == "__main__":
    endpoint = NMNDropModelEndpoint()
    endpoint.run()
