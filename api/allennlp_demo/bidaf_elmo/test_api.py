from overrides import overrides
import pytest

from allennlp_demo.bidaf_elmo.api import BidafElmoModelEndpoint
from allennlp_demo.common.testing import RcModelEndpointTestCase


class TestBidafElmoModelEndpoint(RcModelEndpointTestCase):
    endpoint = BidafElmoModelEndpoint()

    @pytest.mark.skip("Takes too long")
    @overrides
    def test_interpret(self):
        pass

    @pytest.mark.skip("Takes too long")
    @overrides
    def test_attack(self):
        pass
