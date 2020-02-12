# pylint: disable=no-self-use,invalid-name
import copy
import json
import os
import pathlib
import tempfile
from collections import defaultdict

from flask import Response

from allennlp.common.util import JsonDict
from allennlp.common.testing import AllenNlpTestCase
from allennlp.models.archival import load_archive
from allennlp.predictors import Predictor

from app import make_app

TEST_ARCHIVE_FILES = {
        'coreference-resolution': 'tests/fixtures/coref/model.tar.gz'
}

PREDICTOR_NAMES = {
    'coreference-resolution': 'coreference-resolution'
}

PREDICTORS = {
        name: Predictor.from_archive(load_archive(archive_file),
                                     predictor_name=PREDICTOR_NAMES[name])
        for name, archive_file in TEST_ARCHIVE_FILES.items()
}

LIMITS = {
        'coreference-resolution': 21097
}

class TestFlask(AllenNlpTestCase):
    client = None

    def setUp(self):
        super().setUp()
        self.TEST_DIR = pathlib.Path(tempfile.mkdtemp())
        # Create index.html in TEST_DIR
        (self.TEST_DIR / 'index.html').touch()  # pylint: disable=no-member

        if self.client is None:

            self.app = make_app(build_dir=self.TEST_DIR, models={})
            self.app.predictors = PREDICTORS
            self.app.max_request_lengths = LIMITS
            self.app.testing = True
            self.client = self.app.test_client()

    def post_json(self, endpoint: str, data: JsonDict) -> Response:
        return self.client.post(endpoint,
                                content_type="application/json",
                                data=json.dumps(data))

    def tearDown(self):
        super().tearDown()
        try:
            os.remove('access.log')
            os.remove('error.log')
        except FileNotFoundError:
            pass

    def test_coref(self):
        response = self.post_json("/predict/coreference-resolution",
                                  data={"document": "We are looking for a region of central Italy bordering the Adriatic Sea. The area is mostly mountainous and includes Mt. Corno, the highest peak of the mountain range. It also includes many sheep and an Italian entrepreneur has an idea about how to make a little money of them."})
        assert response.status_code == 200
        results = json.loads(response.get_data())
        print(results)
        assert "clusters" in results
        assert "document" in results
        assert "predicted_antecedents" in results
        assert "top_spans" in results
