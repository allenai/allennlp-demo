from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.roberta_snli.api import RobertaSnliModelEndpoint


class TestRobertaSnliModelEndpoint(ModelEndpointTestCase):
    endpoint = RobertaSnliModelEndpoint()
    predict_input = {
        "hypothesis": "Two women are sitting on a blanket near some rocks talking about politics.",
        "premise": "Two women are wandering along the shore drinking iced tea.",
    }
