from typing import List

from overrides import overrides

from allennlp_demo.bidaf_elmo.api import BidafElmoModelEndpoint
from allennlp_demo.common.testing import RcModelEndpointTestCase


class TestBidafElmoModelEndpoint(RcModelEndpointTestCase):
    endpoint = BidafElmoModelEndpoint()

    @overrides
    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [aid for aid in super().attacker_ids() if aid != "hotflip"]
