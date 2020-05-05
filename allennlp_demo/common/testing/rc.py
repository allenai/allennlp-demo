import json
from pathlib import Path
from typing import List

from secrets import token_urlsafe

from allennlp_demo.common.http import ModelEndpoint
from allennlp_demo.common.testing.model_endpoint_test_case import ModelEndpointTestCase


def make_rc_endpoint_test_case():
    """
    Factory function for making a base class for RC endpoint tests.

    The reason we make this class in a factory is so that pytest won't try to run the tests
    within the base class itself.
    """

    class RcModelEndpointTestCase(ModelEndpointTestCase):
        """
        Provides a solid set of test methods for RC models. Individual methods can be overriden
        as necessary.
        """

        FIXTURES_ROOT: Path = (Path(__file__).parent / "fixtures").resolve()

        endpoint: ModelEndpoint

        def setUp(self):
            super().setUp()
            with open(self.FIXTURES_ROOT / "rc.json") as fh:
                self.rc_input = json.load(fh)

        def interpreter_ids(self) -> List[str]:
            return ["simple", "smooth", "integrated"]

        def attacker_ids(self) -> List[str]:
            return ["hotflip", "input-reduction"]

        def test_predict(self):
            resp = self.client.post("/predict", query_string={"no_cache": True}, json=self.rc_input)
            assert resp.status_code == 200
            assert resp.json is not None
            assert len(resp.json["best_span"]) > 0
            assert len(resp.json["best_span_str"].strip()) > 0

        def test_interpret(self):
            for interpreter_id in self.interpreter_ids():
                resp = self.client.post(
                    f"/interpret/{interpreter_id}",
                    query_string={"no_cache": True},
                    json=self.rc_input,
                )
                assert resp.status_code == 200
                assert resp.json is not None
                assert len(resp.json["instance_1"]) > 0
                assert len(resp.json["instance_1"]["grad_input_1"]) > 0
                assert len(resp.json["instance_1"]["grad_input_2"]) > 0

        def test_invalid_interpreter_id(self):
            resp = self.client.post("/interpret/invalid", json={})
            assert resp.status_code == 404
            assert resp.json["error"] == "No interpreter with id invalid"

        def test_attack(self):
            data = {
                "inputs": self.rc_input,
                "input_field_to_attack": "question",
                "grad_input_field": "grad_input_2",
            }
            for attacker_id in self.attacker_ids():
                resp = self.client.post(
                    f"/attack/{attacker_id}", json=data, query_string={"no_cache": True}
                )
                assert resp.status_code == 200
                assert len(resp.json["final"]) > 0
                assert len(resp.json["original"]) > 0

        def test_invalid_attacker_id(self):
            resp = self.client.post("/attack/invalid", json={})
            assert resp.status_code == 404
            assert resp.json["error"] == "No attacker with id invalid"

        def test_invalid_json(self):
            resp = self.client.post(
                "/predict", data="{ invalid: json }", headers={"Content-Type": "application/json"}
            )
            assert resp.status_code == 400

        def test_cache(self):
            prompt = {
                "question": f"Was this cached? {token_urlsafe(8)}",
                "passage": "Only the model knows.",
            }
            resp = self.client.post("/predict", json=prompt)
            assert resp.status_code == 200
            assert "X-Cache-Hit" not in resp.headers

            cached_resp = self.client.post("/predict", json=prompt)
            assert resp.status_code == 200
            assert cached_resp.headers.get("X-Cache-Hit") == "1"

            no_cache_resp = self.client.post(
                "/predict", query_string={"no_cache": True}, json=prompt
            )
            assert resp.status_code == 200
            assert "X-Cache-Hit" not in no_cache_resp.headers

    return RcModelEndpointTestCase
