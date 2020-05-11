from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.coref.api import CorefModelEndpoint


class TestCorefModelEndpoint(ModelEndpointTestCase):
    endpoint = CorefModelEndpoint()
    predict_input = {"document": "The woman reading a newspaper sat on the bench with her dog."}
