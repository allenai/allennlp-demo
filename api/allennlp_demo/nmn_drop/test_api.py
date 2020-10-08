from overrides import overrides

from allennlp_demo.nmn_drop.api import NMNDropModelEndpoint
from allennlp_demo.common.testing import RcModelEndpointTestCase


class TestNMNDropModelEndpoint(RcModelEndpointTestCase):
    endpoint = NMNDropModelEndpoint()

    @overrides
    def check_predict_result(self, result):
        assert result["answer"] is not None
        assert len(result["inputs"]) > 0
        assert len(result["program_execution"]) > 0
