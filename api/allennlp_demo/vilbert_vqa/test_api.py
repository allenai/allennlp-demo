from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.vilbert_vqa.api import VilbertVqaModelEndpoint


class TestVilbertVqaModelEndpoint(RcModelEndpointTestCase):
    endpoint = VilbertVqaModelEndpoint()

    def interpreter_ids(self):
        return []

    def attacker_ids(self):
        return []
