from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.constituency_parser.api import ConstituencyParserModelEndpoint


class TestConstituencyParserModelEndpoint(ModelEndpointTestCase):
    endpoint = ConstituencyParserModelEndpoint()
    predict_input = {"sentence": "If I bring 10 dollars tomorrow, can you buy me lunch?"}
