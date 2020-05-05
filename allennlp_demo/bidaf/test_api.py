from allennlp_demo.common.testing import make_rc_endpoint_test_case
from allennlp_demo.bidaf.api import BidafModelEndpoint


class TestBidafModelEndpoint(make_rc_endpoint_test_case()):  # type: ignore
    endpoint = BidafModelEndpoint()
