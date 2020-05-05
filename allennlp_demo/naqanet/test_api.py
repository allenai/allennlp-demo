from typing import List

from flask.testing import FlaskClient

from allennlp_demo.common.testing import make_rc_endpoint_test_case
from allennlp_demo.naqanet.api import NAQANetModelEndpoint


class TestNAQANetModelEndpoint(make_rc_endpoint_test_case()):  # type: ignore
    endpoint = NAQANetModelEndpoint()

    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [aid for aid in super().attacker_ids() if aid != "hotflip"]

    def test_predict(self):
        resp = self.client.post("/predict", query_string={"no_cache": True}, json=self.rc_input)
        assert resp.status_code == 200
        assert resp.json is not None
        assert "answer" in resp.json
        assert len(resp.json["passage_question_attention"]) > 0
