import os

from allennlp_demo.common import config, http


class WikitablesParserModelEndpoint(http.ModelEndpoint):
    def __init__(self):
        c = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
        super().__init__(c)


if __name__ == "__main__":
    endpoint = WikitablesParserModelEndpoint()
    endpoint.run()
