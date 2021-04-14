import os

from allennlp.common.util import import_module_and_submodules

from allennlp_demo.common import config, http


class LERCModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        import_module_and_submodules("lerc")
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)


if __name__ == "__main__":
    endpoint = LERCModelEndpoint()
    endpoint.run()
