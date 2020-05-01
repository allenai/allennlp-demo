import pytest

from allennlp_demo.common.testing import ModelEndpointTests
from allennlp_demo.bidaf.api import BidafModelEndpoint

@pytest.fixture
def client():
    endpoint = BidafModelEndpoint()
    return endpoint.app.test_client()

class TestBidafModelEndpoint(ModelEndpointTests):
    pass
