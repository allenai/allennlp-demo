import pytest

from flask.testing import FlaskClient
from allennlp_demo.nmn_drop.api import NMNDropModelEndpoint
from allennlp_demo.common.testing import ModelEndpointTests
from typing import List

@pytest.fixture
def client():
    endpoint = NMNDropModelEndpoint()
    return endpoint.app.test_client()

class TestNMNDropModelEndpoint(ModelEndpointTests):
    # The demo doesn't use the attack endpoints, so the tests are disabled.
    def attacker_ids(self) -> List[str]:
        return []

    # The same goes for the interpret ones.
    def interpreter_ids(self) -> List[str]:
        return []

    def test_predict(self, client: FlaskClient):
        resp = client.post("/predict", query_string={ "no_cache": True },
                           json=self.rc_input())
        assert resp.status_code == 200
        assert resp.json is not None
        assert resp.json["answer"] is not None
        assert len(resp.json["outputs"]) > 0
        assert len(resp.json["inputs"]) > 0

