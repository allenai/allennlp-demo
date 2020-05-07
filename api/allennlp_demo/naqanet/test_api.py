from typing import List

from overrides import overrides

from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.naqanet.api import NAQANetModelEndpoint


class TestNAQANetModelEndpoint(RcModelEndpointTestCase):
    endpoint = NAQANetModelEndpoint()

    @overrides
    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [aid for aid in super().attacker_ids() if aid != "hotflip"]

    def check_predict_result(self, result):
        assert "answer" in result
        assert len(result["passage_question_attention"]) > 0
