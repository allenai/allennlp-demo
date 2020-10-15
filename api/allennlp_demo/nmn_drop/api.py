import os

from allennlp.common.util import import_submodules

from allennlp_demo.common import config, http


class NMNDropModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        import_submodules("semqa")
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)


if __name__ == "__main__":
    endpoint = NMNDropModelEndpoint()
    endpoint.run()
