import json
import os

from allennlp.common import JsonDict
from allennlp.common.testing import AllenNlpTestCase
from flask import Response


class TestEndToEnd(AllenNlpTestCase):
    client = None

    def setUp(self):
        super().setUp()

        if self.client is None:
            with open("models.json") as f:
                model_names = [
                    model_name
                    for model_name, model_spec in json.load(f).items()
                    if "image" not in model_spec    # We don't want to try models pinned to a Docker image.
                ]

            from server.models import load_demo_models
            self.models = load_demo_models("models.json", model_names)
            from app import make_app
            self.app = make_app(self.models)
            self.app.testing = True
            self.client = self.app.test_client()

    def post_json(self, endpoint: str, data: JsonDict) -> Response:
        return self.client.post(
            endpoint,
            content_type="application/json",
            data=json.dumps(data))

    def tearDown(self):
        super().tearDown()
        try:
            os.remove('access.log')
            os.remove('error.log')
        except FileNotFoundError:
            pass
