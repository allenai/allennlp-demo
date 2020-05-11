from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.fine_grained_ner.api import FineGrainedNerModelEndpoint


class TestFineGrainedNerModelEndpoint(ModelEndpointTestCase):
    endpoint = FineGrainedNerModelEndpoint()
    predict_input = {
        "sentence": "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"
    }
