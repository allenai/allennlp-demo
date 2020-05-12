from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.named_entity_recognition.api import NerModelEndpoint


class TestNerModelEndpoint(ModelEndpointTestCase):
    endpoint = NerModelEndpoint()
    predict_input = {
        "sentence": "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"
    }
