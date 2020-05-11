from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.dependency_parser.api import DependencyParserModelEndpoint


class TestDependencyParserModelEndpoint(ModelEndpointTestCase):
    endpoint = DependencyParserModelEndpoint()
    predict_input = {"sentence": "If I bring 10 dollars tomorrow, can you buy me lunch?"}
