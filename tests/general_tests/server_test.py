# pylint: disable=no-self-use,invalid-name
import copy
import json
import os
import pathlib
import tempfile
from collections import defaultdict
import pytest

from flask import Response

from allennlp.common.util import JsonDict
from allennlp.common.testing import AllenNlpTestCase
from allennlp.models.archival import load_archive
from allennlp.predictors import Predictor

import app
from app import make_app
from server.db import InMemoryDemoDatabase
from server.models import DemoModel

TEST_ARCHIVE_FILES = {
        'reading-comprehension': 'tests/fixtures/bidaf/model.tar.gz',
        'semantic-role-labeling': 'tests/fixtures/srl/model.tar.gz',
        'textual-entailment': 'tests/fixtures/decomposable_attention/model.tar.gz'
}

PREDICTOR_NAMES = {
    'reading-comprehension': 'reading-comprehension',
        'semantic-role-labeling': 'semantic-role-labeling',
        'textual-entailment': 'textual-entailment'
}

PREDICTORS = {
        name: Predictor.from_archive(load_archive(archive_file),
                                     predictor_name=PREDICTOR_NAMES[name])
        for name, archive_file in TEST_ARCHIVE_FILES.items()
}

LIMITS = {
        'reading-comprehension': 311108,
        'semantic-role-labeling': 4590,
        'textual-entailment': 13129
}


class CountingPredictor(Predictor):
    """
    bogus predictor that just returns a copy of its inputs
    and also counts how many times it was called with a given input
    """
    # pylint: disable=abstract-method
    def __init__(self):                 # pylint: disable=super-init-not-called
        self.calls = defaultdict(int)

    def predict_json(self, inputs: JsonDict) -> JsonDict:
        key = json.dumps(inputs)
        self.calls[key] += 1
        return copy.deepcopy(inputs)

class FailingPredictor(Predictor):
    """
    Guaranteed to fail.
    """
    # pylint: disable=abstract-method
    def __init__(self):                 # pylint: disable=super-init-not-called
        pass

    def predict_json(self, inputs: JsonDict) -> JsonDict:
        raise RuntimeError("Predicting is hard!")

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

    def test_list_models(self):
        response = self.client.get("/models")
        data = json.loads(response.get_data())
        assert "reading-comprehension" in set(data["models"])

    def test_unknown_model(self):
        response = self.post_json("/predict/bogus_model",
                                  data={"input": "broken"})
        assert response.status_code == 400
        data = response.get_data()
        assert b"unknown model" in data and b"bogus_model" in data

    def test_reading_comprehension(self):
        response = self.post_json("/predict/reading-comprehension",
                                  data={"passage": "the super bowl was played in seattle",
                                        "question": "where was the super bowl played?"})

        assert response.status_code == 200
        results = json.loads(response.data)
        assert "best_span" in results

    def test_textual_entailment(self):
        response = self.post_json("/predict/textual-entailment",
                                  data={"premise": "the super bowl was played in seattle",
                                        "hypothesis": "the super bowl was played in ohio"})
        assert response.status_code == 200
        results = json.loads(response.data)
        assert "label_probs" in results

    def test_semantic_role_labeling(self):
        response = self.post_json("/predict/semantic-role-labeling",
                                  data={"sentence": "the super bowl was played in seattle"})
        assert response.status_code == 200
        results = json.loads(response.get_data())
        assert "verbs" in results

    @pytest.mark.skip(reason="Test fixtures is out of date.")
    def test_open_information_extraction(self):
        response = self.post_json("/predict/open-information-extraction",
                                  data={"sentence": "the super bowl was played in seattle"})
        assert response.status_code == 200
        results = json.loads(response.get_data())
        assert "verbs" in results

    def test_caching(self):
        predictor = CountingPredictor()
        data = {"input1": "this is input 1", "input2": 10}
        key = json.dumps(data)

        self.app.predictors["counting"] = predictor
        self.app.max_request_lengths["counting"] = 100

        # call counts should be empty
        assert not predictor.calls

        response = self.post_json("/predict/counting", data=data)
        assert response.status_code == 200
        assert json.loads(response.get_data()) == data

        # call counts should reflect the one call
        assert predictor.calls.get(key) == 1
        assert len(predictor.calls) == 1

        # make a different call
        noyes = {"no": "yes"}
        response = self.post_json("/predict/counting", data=noyes)
        assert response.status_code == 200
        assert json.loads(response.get_data()) == noyes

        # call counts should reflect two calls
        assert predictor.calls[key] == 1
        assert predictor.calls[json.dumps(noyes)] == 1
        assert len(predictor.calls) == 2

        # repeated calls should come from cache and not hit the predictor
        for _ in range(3):
            response = self.post_json("/predict/counting", data=data)
            assert response.status_code == 200
            assert json.loads(response.get_data()) == data

            # these should all be cached, so call counts should not be updated
            assert predictor.calls[key] == 1
            assert predictor.calls[json.dumps(noyes)] == 1
            assert len(predictor.calls) == 2

    def test_disable_caching(self):
        predictor = CountingPredictor()
        application = make_app(build_dir=self.TEST_DIR, models={}, cache_size=0)
        application.predictors = {"counting": predictor}
        application.max_request_lengths["counting"] = 100
        application.testing = True
        client = application.test_client()

        data = {"input1": "this is input 1", "input2": 10}
        key = json.dumps(data)

        assert not predictor.calls

        for i in range(5):
            response = client.post("/predict/counting",
                                   content_type="application/json",
                                   data=json.dumps(data))
            assert response.status_code == 200
            assert json.loads(response.get_data()) == data

            # cache is disabled, so call count should keep incrementing
            assert predictor.calls[key] == i + 1
            assert len(predictor.calls) == 1

    def test_missing_static_dir(self):
        fake_dir = self.TEST_DIR / 'this' / 'directory' / 'does' / 'not' / 'exist'

        with self.assertRaises(SystemExit) as context:
            make_app(fake_dir, models={})

        assert context.exception.code == -1  # pylint: disable=no-member

    def test_permalinks_fail_gracefully_with_no_database(self):
        application = make_app(build_dir=self.TEST_DIR, models={})
        predictor = CountingPredictor()
        application.predictors = {"counting": predictor}
        application.max_request_lengths["counting"] = 100
        application.testing = True
        client = application.test_client()

        # Make a prediction, no permalinks.
        data = {"some": "input"}
        response = client.post("/predict/counting", content_type="application/json", data=json.dumps(data))

        assert response.status_code == 200

        # With permalinks not enabled, the result shouldn't contain a slug.
        result = json.loads(response.get_data())
        assert "slug" not in result

        # With permalinks not enabled, a post to the /permadata endpoint should be a 400.
        response = self.client.post("/permadata/counting", data="""{"slug": "someslug"}""")
        assert response.status_code == 400

    def test_permalinks_work(self):
        db = InMemoryDemoDatabase()
        application = make_app(build_dir=self.TEST_DIR, demo_db=db, models={})
        predictor = CountingPredictor()
        application.predictors = {"counting": predictor}
        application.max_request_lengths["counting"] = 100
        application.testing = True
        client = application.test_client()

        def post(endpoint: str, data: JsonDict) -> Response:
            return client.post(endpoint, content_type="application/json", data=json.dumps(data))

        data = {"some": "input"}
        response = post("/predict/counting", data=data)

        assert response.status_code == 200
        result = json.loads(response.get_data())
        slug = result.get("slug")
        assert slug is not None

        response = post("/permadata/counting", data={"slug": "not the right slug"})
        assert response.status_code == 400

        response = post("/permadata/counting", data={"slug": slug})
        assert response.status_code == 200
        result2 = json.loads(response.get_data())
        assert set(result2.keys()) == {"modelName", "requestData", "responseData"}
        assert result2["modelName"] == "counting"
        assert result2["requestData"] == data
        assert result2["responseData"] == result

    def test_db_resilient_to_prediction_failure(self):
        db = InMemoryDemoDatabase()
        application = make_app(build_dir=self.TEST_DIR, demo_db=db, models={})
        predictor = FailingPredictor()
        application.predictors = {"failing": predictor}
        application.max_request_lengths["failing"] = 100
        # Keep error handling as it would be in the actual application.
        application.testing = False
        client = application.test_client()

        def post(endpoint: str, data: JsonDict) -> Response:
            return client.post(endpoint, content_type="application/json", data=json.dumps(data))

        data = {"some": "very nasty input that will cause a failure"}
        response = post("/predict/failing", data=data)
        assert response.status_code == 500

        # This won't be returned when the server errors out, but the necessary information is still
        # in the database for subsequent analysis.
        slug = app.int_to_slug(0)

        response = post("/permadata/counting", data={"slug": slug})
        assert response.status_code == 200
        result = json.loads(response.get_data())
        assert set(result.keys()) == {"modelName", "requestData", "responseData"}
        assert result["modelName"] == "failing"
        assert result["requestData"] == data
        assert result["responseData"] == {}

    def test_microservice(self):
        models = {
            'reading-comprehension': DemoModel(TEST_ARCHIVE_FILES['reading-comprehension'],
                                               'reading-comprehension',
                                               LIMITS['reading-comprehension'])
        }

        app = make_app(build_dir=self.TEST_DIR, models=models)
        app.testing = True


        client = app.test_client()

        # Should have only one model
        response = client.get("/models")
        data = json.loads(response.get_data())
        assert data["models"] == ["reading-comprehension"]

        # Should return results for that model
        response = client.post("/predict/reading-comprehension",
                               content_type="application/json",
                               data="""{"passage": "the super bowl was played in seattle",
                                        "question": "where was the super bowl played?"}""")
        assert response.status_code == 200
        results = json.loads(response.data)
        assert "best_span" in results

        # Other models should be unknown
        response = client.post("/predict/textual-entailment",
                               content_type="application/json",
                               data="""{"premise": "the super bowl was played in seattle",
                                        "hypothesis": "the super bowl was played in ohio"}""")
        assert response.status_code == 400
        data = response.get_data()
        assert b"unknown model" in data and b"textual-entailment" in data
