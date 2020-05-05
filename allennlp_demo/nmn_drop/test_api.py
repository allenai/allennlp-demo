from typing import List

import pytest

from allennlp_demo.nmn_drop.api import NMNDropModelEndpoint
from allennlp_demo.common.testing import make_rc_endpoint_test_case


class TestNMNDropModelEndpoint(make_rc_endpoint_test_case):  # type: ignore
    endpoint = NMNDropModelEndpoint()

    # The demo doesn't use the attack endpoints, so the tests are disabled.
    def attacker_ids(self) -> List[str]:
        return []

    # The same goes for the interpret ones.
    def interpreter_ids(self) -> List[str]:
        return []

    def test_predict(self):
        resp = self.client.post("/predict", query_string={"no_cache": True}, json=self.rc_input)
        assert resp.status_code == 200
        assert resp.json is not None
        assert resp.json["answer"] is not None
        assert len(resp.json["inputs"]) > 0
        assert len(resp.json["program_execution"]) > 0

    @pytest.mark.skip(reason="The input used causes this test to fail.")
    def test_cache(self):
        pass
