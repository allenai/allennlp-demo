from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.semantic_role_labeling.api import SrlModelEndpoint


class TestSrlModelEndpoint(ModelEndpointTestCase):
    endpoint = SrlModelEndpoint()
    predict_input = {
        "sentence": "Did Uriah honestly think he could beat the game in under three hours?"
    }
