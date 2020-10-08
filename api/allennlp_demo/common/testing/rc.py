from overrides import overrides

from allennlp_demo.common.http import ModelEndpoint
from allennlp_demo.common.testing.model_endpoint_test_case import ModelEndpointTestCase


class RcModelEndpointTestCase(ModelEndpointTestCase):
    """
    Provides a solid set of test methods for RC models. Individual methods can be overriden
    as necessary.
    """

    endpoint: ModelEndpoint

    predict_input = {
        "passage": (
            "A reusable launch system (RLS, or reusable launch vehicle, RLV) "
            "is a launch system which is capable of launching a payload into "
            "space more than once. This contrasts with expendable launch systems, "
            "where each launch vehicle is launched once and then discarded. "
            "No completely reusable orbital launch system has ever been created. "
            "Two partially reusable launch systems were developed, the "
            "Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: "
            "the orbiter (which included the Space Shuttle main engines and the "
            "Orbital Maneuvering System engines), and the two solid rocket boosters "
            "were reused after several months of refitting work for each launch. "
            "The external tank was discarded after each flight."
        ),
        "question": "How many partially reusable launch systems were developed?",
    }

    @overrides
    def check_predict_result(self, result):
        assert len(result["best_span"]) > 0
        assert len(result["best_span_str"].strip()) > 0

    @overrides
    def test_interpret(self):
        for interpreter_id in self.interpreter_ids():
            resp = self.client.post(
                f"/interpret/{interpreter_id}",
                query_string={"no_cache": True},
                json=self.predict_input,
            )
            assert resp.status_code == 200
            assert resp.json is not None
            assert len(resp.json["instance_1"]) > 0
            assert len(resp.json["instance_1"]["grad_input_1"]) > 0
            assert len(resp.json["instance_1"]["grad_input_2"]) > 0

    @overrides
    def test_attack(self):
        data = {
            "inputs": self.predict_input,
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
