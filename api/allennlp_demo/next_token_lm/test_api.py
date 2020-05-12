from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.next_token_lm.api import NextTokenLmModelEndpoint


class TestNextTokenLmModelEndpoint(ModelEndpointTestCase):
    endpoint = NextTokenLmModelEndpoint()
    predict_input = {"sentence": "AlleNLP is"}
