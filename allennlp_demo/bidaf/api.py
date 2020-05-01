import sys
import os
# This adds ../ to the PYTHONPATH, so that allennlp_demo imports work.
sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))))

from allennlp_demo.common import config, http

if __name__ == "__main__":
    config = config.Model.from_file(os.path.join(os.path.dirname(__file__), "model.json"))
    endpoint = http.ModelEndpoint(config)
    endpoint.run()
