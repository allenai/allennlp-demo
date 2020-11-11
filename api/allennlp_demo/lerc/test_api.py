from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.lerc.api import LERCEndpoint


class TestLERCEndpoint(ModelEndpointTestCase):
    endpoint = LERCEndpoint()
    predict_input = {
        "context": "Sasha beat the test easily because she studied so hard.",
        "question": "What will happen to others?",
        "reference": "they will be jealous",
        "candidate": "they will appreciate Sasha"
    }
