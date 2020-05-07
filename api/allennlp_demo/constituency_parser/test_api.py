from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.constituency_parser.api import ConstituencyParserModelEndpoint


class TestConstituencyParserModelEndpoint(ModelEndpointTestCase):
    endpoint = ConstituencyParserModelEndpoint()
