import os
import requests
import pytest
import json

from secrets import token_urlsafe
from typing import Mapping, List

class ModelEndpointTests:
    """
    Defines a standard battery of tests for model endpoints. Invididual methods can be overriden
    to change behavior.
    """
    def rc_input(self) -> Mapping:
        with open(os.path.join(os.path.dirname(__file__), "fixtures", "rc.json"), "r") as fh:
            return json.load(fh)

    def url(self, path: str = "/") -> str:
        origin = os.getenv("ORIGIN", "http://localhost:8000")
        return f"{origin}{path}"

    def interpreter_ids(self) -> List[str]:
        return [ "simple", "smooth", "integrated" ]

    def attacker_ids(self) -> List[str]:
        return [ "hotflip", "input-reduction" ]

    def test_predict(self):
        resp = requests.post(self.url("/predict"),
                             params={ "no_cache": True }, json=self.rc_input())
        resp.raise_for_status()
        prediction = resp.json()
        assert prediction is not None
        assert len(prediction["best_span"]) > 0
        assert len(prediction["best_span_str"].strip()) > 0

    def test_interpret(self):
        for interpreter_id in self.interpreter_ids():
            resp = requests.post(self.url(f"/interpret/{interpreter_id}"),
                                 params={ "no_cache": True }, json=self.rc_input())
            resp.raise_for_status()
            saliency = resp.json()
            assert saliency is not None
            assert len(saliency["instance_1"]) > 0
            assert len(saliency["instance_1"]["grad_input_1"]) > 0
            assert len(saliency["instance_1"]["grad_input_2"]) > 0

    def test_invalid_interpreter_id(self):
        resp = requests.post(self.url("/interpret/invalid"), json={})
        assert resp.status_code == 404
        assert resp.json()["error"] == "No interpreter with id invalid"

    def test_attack(self):
        data = { "inputs": self.rc_input(), "input_field_to_attack": "question",
                "grad_input_field": "grad_input_2" }
        for attacker_id in self.attacker_ids():
            resp = requests.post(self.url(f"/attack/{attacker_id}"), json=data,
                                 params={ "no_cache": True })
            resp.raise_for_status()
            attack = resp.json()
            assert len(attack["final"]) > 0
            assert len(attack["original"]) > 0

    def test_invalid_attacker_id(self):
        resp = requests.post(self.url("/attack/invalid"), json={})
        assert resp.status_code == 404
        assert resp.json()["error"] == "No attacker with id invalid"

    def test_invalid_json(self):
        resp = requests.post(self.url("/predict"), data="{ invalid: json }",
                            headers={ "Content-Type": "application/json"})
        assert resp.status_code == 400

    def test_cache(self):
        prompt = { "question": f"Was this cached? {token_urlsafe(8)}",
                   "passage": "Only the model knows." }
        resp = requests.post(self.url("/predict"), json=prompt)
        resp.raise_for_status()
        assert "X-Cache-Hit" not in resp.headers

        cached_resp = requests.post(self.url("/predict"), json=prompt)
        cached_resp.raise_for_status()
        assert cached_resp.headers.get("X-Cache-Hit") == "1"

        no_cache_resp = requests.post(self.url("/predict"), params={ "no_cache": True }, json=prompt)
        no_cache_resp.raise_for_status()
        assert "X-Cache-Hit" not in no_cache_resp.headers
