from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.transformer_qa.api import TransformerQaModelEndpoint


class TestTransformerQaModelEndpoint(RcModelEndpointTestCase):
    endpoint = TransformerQaModelEndpoint()

    def interpreter_ids(self):
        return []

    def attacker_ids(self):
        return []
