from typing import List

from overrides import overrides

from allennlp_demo.nmn_drop.api import NMNDropModelEndpoint
from allennlp_demo.common.testing import RcModelEndpointTestCase


class TestNMNDropModelEndpoint(RcModelEndpointTestCase):
    endpoint = NMNDropModelEndpoint()

    # The demo doesn't use the attack endpoints, so the tests are disabled.
    @overrides
    def attacker_ids(self) -> List[str]:
        return []

    # The same goes for the interpret ones.
    @overrides
    def interpreter_ids(self) -> List[str]:
        return []

    def check_predict_result(self, result):
        assert result["answer"] is not None
        assert len(result["inputs"]) > 0
        assert len(result["program_execution"]) > 0
