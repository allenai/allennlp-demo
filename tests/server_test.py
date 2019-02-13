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
from allennlp.service.predictors import Predictor

import app
from app import make_app
from server.db import InMemoryDemoDatabase

TEST_ARCHIVE_FILES = {
        'machine-comprehension': 'tests/fixtures/bidaf/model.tar.gz',
        'semantic-role-labeling': 'tests/fixtures/srl/model.tar.gz',
        'textual-entailment': 'tests/fixtures/decomposable_attention/model.tar.gz',
        'open-information-extraction': 'tests/fixtures/openie/model.tar.gz',
        'event2mind': 'tests/fixtures/event2mind/model.tar.gz'
}

PREDICTORS = {
        name: Predictor.from_archive(load_archive(archive_file),
                                     predictor_name=name)
        for name, archive_file in TEST_ARCHIVE_FILES.items()
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

            self.app = make_app(build_dir=self.TEST_DIR)
            self.app.predictors = PREDICTORS
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
        assert "machine-comprehension" in set(data["models"])

    def test_unknown_model(self):
        response = self.post_json("/predict/bogus_model",
                                  data={"input": "broken"})
        assert response.status_code == 400
        data = response.get_data()
        assert b"unknown model" in data and b"bogus_model" in data

    def test_machine_comprehension(self):
        response = self.post_json("/predict/machine-comprehension",
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

    def test_open_information_extraction(self):
        response = self.post_json("/predict/open-information-extraction",
                                  data={"sentence": "the super bowl was played in seattle"})
        assert response.status_code == 200
        results = json.loads(response.get_data())
        assert "verbs" in results

    def test_event2mind(self):
        response = self.post_json("/predict/event2mind",
                                  data={"source": "PersonX starts to yell at PersonY"})
        assert response.status_code == 200
        results = json.loads(response.get_data())
        assert "xintent_top_k_predicted_tokens" in results
        assert "xreact_top_k_predicted_tokens" in results
        assert "oreact_top_k_predicted_tokens" in results

    def test_caching(self):
        predictor = CountingPredictor()
        data = {"input1": "this is input 1", "input2": 10}
        key = json.dumps(data)

        self.app.predictors["counting"] = predictor

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
        app.CACHE_SIZE = 0

        predictor = CountingPredictor()
        application = make_app(build_dir=self.TEST_DIR)
        application.predictors = {"counting": predictor}
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

        with self.assertRaises(SystemExit) as cm:
            make_app(fake_dir)
            assert cm.code == -1  # pylint: disable=no-member

    def test_permalinks_fail_gracefully_with_no_database(self):
        application = make_app(build_dir=self.TEST_DIR)
        predictor = CountingPredictor()
        application.predictors = {"counting": predictor}
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
        response = self.client.post("/permadata", data="""{"slug": "someslug"}""")
        assert response.status_code == 400

    def test_permalinks_work(self):
        db = InMemoryDemoDatabase()
        application = make_app(build_dir=self.TEST_DIR, demo_db=db)
        predictor = CountingPredictor()
        application.predictors = {"counting": predictor}
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

        response = post("/permadata", data={"slug": "not the right slug"})
        assert response.status_code == 400

        response = post("/permadata", data={"slug": slug})
        assert response.status_code == 200
        result2 = json.loads(response.get_data())
        assert set(result2.keys()) == {"modelName", "requestData", "responseData"}
        assert result2["modelName"] == "counting"
        assert result2["requestData"] == data
        assert result2["responseData"] == result

    def test_db_resilient_to_prediction_failure(self):
        db = InMemoryDemoDatabase()
        application = make_app(build_dir=self.TEST_DIR, demo_db=db)
        predictor = FailingPredictor()
        application.predictors = {"failing": predictor}
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

        response = post("/permadata", data={"slug": slug})
        assert response.status_code == 200
        result = json.loads(response.get_data())
        assert set(result.keys()) == {"modelName", "requestData", "responseData"}
        assert result["modelName"] == "failing"
        assert result["requestData"] == data
        assert result["responseData"] == {}
