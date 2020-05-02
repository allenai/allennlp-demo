import sys
import os
# This adds ../ to the PYTHONPATH, so that allennlp_demo imports work.
sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))))

from allennlp_demo.common import config, http
from allennlp.common.util import import_submodules
from typing import List

class NMNDropModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        import_submodules("semqa")
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c, load_plugins=False)

    # The demo doesn't use the attack endpoints, so they're disabled for now.
    def attacker_ids(self) -> List[str]:
        return []

    # The same goes for the interpret endpoints.
    def interpreter_ids(self) -> List[str]:
        return []


if __name__ == "__main__":
    endpoint = NMNDropModelEndpoint()
    endpoint.run()
