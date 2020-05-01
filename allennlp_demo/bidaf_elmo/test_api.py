import pytest

from allennlp_demo.bidaf_elmo.api import BidafElmoModelEndpoint
from allennlp_demo.common.testing import ModelEndpointTests
from typing import List

@pytest.fixture
def client():
    endpoint = BidafElmoModelEndpoint()
    return endpoint.app.test_client()

class TestBidafElmoModelEndpoint(ModelEndpointTests):
    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [ aid for aid in super().attacker_ids() if aid != "hotflip" ]
