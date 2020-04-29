import sys
import os
# This adds ../../ to the PYTHONPATH, so that allennlp_demo imports work.
sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))))

from allennlp.version import VERSION
from allennlp.predictors import Predictor
from allennlp.common import JsonDict
from allennlp_demo.common import logs, config
from allennlp_plugins import allennlp_models
from dataclasses import asdict
from flask import Flask, jsonify, request
from flask.logging import default_handler

if __name__ == '__main__':
    app = Flask(__name__)
    logs.init(app)

    model = config.Model.from_file(os.path.join(os.path.dirname(__file__), 'model.json'))
    predictor = Predictor.from_path(model.archive_file, model.predictor_name)

    @app.route('/')
    def info() -> str:
        return jsonify({ **asdict(model), "allennlp": VERSION })

    @app.route('/predict', methods=['POST'])
    def predict() -> JsonDict:
        return predictor.predict_json(request.get_json())

    app.run(host="0.0.0.0", port=8000)
