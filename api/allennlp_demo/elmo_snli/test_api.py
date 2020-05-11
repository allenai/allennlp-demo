from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.elmo_snli.api import ElmoSnliModelEndpoint


class TestElmoSnliModelEndpoint(ModelEndpointTestCase):
    endpoint = ElmoSnliModelEndpoint()
    predict_input = {
        "hypothesis": "Two women are sitting on a blanket near some rocks talking about politics.",
        "premise": "Two women are wandering along the shore drinking iced tea.",
    }
