import os
from pathlib import Path
from typing import Optional, Any, Dict, List

from flask.testing import FlaskClient
from flask.wrappers import Response

from allennlp_demo.common.http import ModelEndpoint
from allennlp_demo.common.config import VALID_ATTACKERS, VALID_INTERPRETERS


class ModelEndpointTestCase:
    """
    A base class to run model endpoint tests.

    Each endpoint should have a corresponding test class that derives from this.
    """

    PROJECT_ROOT: Path = (Path(__file__).parent / os.pardir / os.pardir / os.pardir).resolve()
    """
    This points to the absolute path of `api/`. So, for example, this file is located
    in `PROJECT_ROOT / allennlp_demo / common / testing`.
    """

    endpoint: ModelEndpoint
    """
    Should be defined by each subclass.
    """

    predict_input: Dict[str, Any]
    """
    Payload to send to the /predict route.
    """

    _client: Optional[FlaskClient] = None

    @property
    def client(self) -> FlaskClient:
        """
        Provides a Flask test client that you can use to send requests to the model endpoint.
        """
        if self._client is None:
            self._client = self.endpoint.app.test_client()
        return self._client

    @classmethod
    def setup_class(cls):
        pass

    @classmethod
    def teardown_class(cls):
        pass

    def setup_method(self):
        # Clear the caches before each call.
        self.endpoint.predict_with_cache.cache_clear()
        self.endpoint.interpret_with_cache.cache_clear()
        self.endpoint.attack_with_cache.cache_clear()

    def teardown_method(self):
        pass

    def interpreter_ids(self) -> List[str]:
        return list(self.endpoint.interpreters.keys())

    def attacker_ids(self) -> List[str]:
        return list(self.endpoint.attackers.keys())

    def test_predict(self):
        """
        Test the /predict route.
        """
        response = self.client.post("/predict", json=self.predict_input)
        self.check_response_okay(response, cache_hit=False)
        self.check_predict_result(response.json)

        response = self.client.post("/predict", json=self.predict_input)
        self.check_response_okay(response, cache_hit=True)
        self.check_predict_result(response.json)

        response = self.client.post(
            "/predict", query_string={"no_cache": True}, json=self.predict_input
        )
        self.check_response_okay(response, cache_hit=False)
        self.check_predict_result(response.json)

    def test_predict_invalid_input(self):
        """
        Ensure a 400 is returned when bad input is given to the /predict route.
        """
        response = self.client.post(
            "/predict", data="{ invalid: json }", headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400

    def test_info(self):
        """
        Ensure the `/` info / health check route works.
        """
        response = self.client.get("/")
        self.check_response_okay(response)

    def check_response_okay(self, response: Response, cache_hit: bool = False) -> None:
        """
        Ensure the response from a route is okay.
        """
        assert response.status_code == 200
        assert response.json is not None
        if not cache_hit:
            assert "X-Cache-Hit" not in response.headers
        else:
            assert response.headers["X-Cache-Hit"] == "1"

    def check_predict_result(self, result: Dict[str, Any]) -> None:
        """
        Subclasses can override this method to run additional checks on the JSON
        result of the /predict route.
        """
        pass

    def test_interpret(self) -> None:
        """
        Subclasses can override this method to test interpret functionality.
        """
        pass

    def test_attack(self) -> None:
        """
        Subclasses can override this method to test attack functionality.
        """
        pass

    def test_unknown_interpreter_id(self):
        resp = self.client.post("/interpret/invalid", json={})
        assert resp.status_code == 404
        assert resp.json["error"] == "No interpreter with id 'invalid'"

    def test_unknown_attacker_id(self):
        resp = self.client.post("/attack/invalid", json={})
        assert resp.status_code == 404
        assert resp.json["error"] == "No attacker with id 'invalid'"

    def test_invalid_interpreter_id(self):
        for interpreter_id in VALID_INTERPRETERS:
            if interpreter_id not in self.interpreter_ids():
                resp = self.client.post(f"/interpret/{interpreter_id}", json={})
                assert resp.status_code == 404
                assert (
                    resp.json["error"]
                    == f"Interpreter with id '{interpreter_id}' is not supported for this model"
                ), resp.json["error"]

    def test_invalid_attacker_id(self):
        for attacker_id in VALID_ATTACKERS:
            if attacker_id not in self.attacker_ids():
                resp = self.client.post(f"/attack/{attacker_id}", json={})
                assert resp.status_code == 404
                assert (
                    resp.json["error"]
                    == f"Attacker with id '{attacker_id}' is not supported for this model"
                ), resp.json["error"]
