import pytest

from flask.testing import FlaskClient
from allennlp_demo.common.testing import ModelEndpointTests
from allennlp_demo.naqanet.api import NAQANetModelEndpoint
from typing import List


@pytest.fixture
def client():
    endpoint = NAQANetModelEndpoint()
    return endpoint.app.test_client()


class TestNAQANetModelEndpoint(ModelEndpointTests):
    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [aid for aid in super().attacker_ids() if aid != "hotflip"]

    def test_predict(self, client: FlaskClient):
        resp = client.post("/predict", query_string={"no_cache": True}, json=self.rc_input())
        assert resp.status_code == 200
        assert resp.json is not None
        assert "answer" in resp.json
        assert len(resp.json["passage_question_attention"]) > 0
