from overrides import overrides

from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.naqanet.api import NAQANetModelEndpoint


class TestNAQANetModelEndpoint(RcModelEndpointTestCase):
    endpoint = NAQANetModelEndpoint()

    @overrides
    def check_predict_result(self, result):
        assert "answer" in result
        assert len(result["passage_question_attention"]) > 0
