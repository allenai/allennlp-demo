from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.bidaf.api import BidafModelEndpoint


class TestBidafModelEndpoint(RcModelEndpointTestCase):
    endpoint = BidafModelEndpoint()
