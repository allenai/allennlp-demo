import os
from pathlib import Path
from typing import Optional, Any, Dict

from flask.testing import FlaskClient
from flask.wrappers import Response

from allennlp_demo.common.http import ModelEndpoint


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

    predict_payload: Dict[str, Any]
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
        pass

    def teardown_method(self):
        pass

    def test_predict(self):
        """
        Test the /predict route.
        """
        response = self.client.post("/predict", json=self.predict_payload)
        self.check_response_okay(response, cache_hit=False)
        self.check_predict_result(response.json)

        response = self.client.post("/predict", json=self.predict_payload)
        self.check_response_okay(response, cache_hit=True)
        self.check_predict_result(response.json)

        response = self.client.post(
            "/predict", query_string={"no_cache": True}, json=self.predict_payload
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
