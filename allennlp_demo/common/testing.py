import os
import pytest
import json

from secrets import token_urlsafe
from typing import Mapping, List
from flask.testing import FlaskClient
from flask import Response

class ModelEndpointTests:
    """
    Defines a standard battery of tests for model endpoints. Invididual methods can be overriden
    to change behavior.
    """
    def rc_input(self) -> Mapping:
        with open(os.path.join(os.path.dirname(__file__), "fixtures", "rc.json"), "r") as fh:
            return json.load(fh)

    def interpreter_ids(self) -> List[str]:
        return [ "simple", "smooth", "integrated" ]

    def attacker_ids(self) -> List[str]:
        return [ "hotflip", "input-reduction" ]

    def test_predict(self, client: FlaskClient):
        client.post()
        resp: Response = client.post("/predict", query_string={ "no_cache": True },
                                     json=self.rc_input())
        assert resp.status_code == 200
        assert resp.json is not None
        assert len(resp.json["best_span"]) > 0
        assert len(resp.json["best_span_str"].strip()) > 0

    def test_interpret(self, client: FlaskClient):
        for interpreter_id in self.interpreter_ids():
            resp = client.post(f"/interpret/{interpreter_id}", query_string={ "no_cache": True },
                               json=self.rc_input())
            assert resp.status_code == 200
            assert resp.json is not None
            assert len(resp.json["instance_1"]) > 0
            assert len(resp.json["instance_1"]["grad_input_1"]) > 0
            assert len(resp.json["instance_1"]["grad_input_2"]) > 0

    def test_invalid_interpreter_id(self, client: FlaskClient):
        resp = client.post("/interpret/invalid", json={})
        assert resp.status_code == 404
        assert resp.json["error"] == "No interpreter with id invalid"

    def test_attack(self, client: FlaskClient):
        data = { "inputs": self.rc_input(), "input_field_to_attack": "question",
                "grad_input_field": "grad_input_2" }
        for attacker_id in self.attacker_ids():
            resp = client.post(f"/attack/{attacker_id}", json=data,
                               query_string={ "no_cache": True })
            assert resp.status_code == 200
            assert len(resp.json["final"]) > 0
            assert len(resp.json["original"]) > 0

    def test_invalid_attacker_id(self, client: FlaskClient):
        resp = client.post("/attack/invalid", json={})
        assert resp.status_code == 404
        assert resp.json["error"] == "No attacker with id invalid"

    def test_invalid_json(self, client: FlaskClient):
        resp = client.post("/predict", data="{ invalid: json }",
                           headers={ "Content-Type": "application/json"})
        assert resp.status_code == 400

    def test_cache(self, client: FlaskClient):
        prompt = { "question": f"Was this cached? {token_urlsafe(8)}",
                   "passage": "Only the model knows." }
        resp = client.post("/predict", json=prompt)
        assert resp.status_code == 200
        assert "X-Cache-Hit" not in resp.headers

        cached_resp = client.post("/predict", json=prompt)
        assert resp.status_code == 200
        assert cached_resp.headers.get("X-Cache-Hit") == "1"

        no_cache_resp = client.post("/predict", query_string={ "no_cache": True }, json=prompt)
        assert resp.status_code == 200
        assert "X-Cache-Hit" not in no_cache_resp.headers
