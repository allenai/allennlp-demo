from typing import List

from allennlp_demo.bidaf_elmo.api import BidafElmoModelEndpoint
from allennlp_demo.common.testing import make_rc_endpoint_test_case


class TestBidafElmoModelEndpoint(make_rc_endpoint_test_case()):  # type: ignore
    endpoint = BidafElmoModelEndpoint()

    def attacker_ids(self) -> List[str]:
        # The hotflip attack for this model is currently broken.
        return [aid for aid in super().attacker_ids() if aid != "hotflip"]
