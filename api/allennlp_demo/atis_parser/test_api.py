from allennlp_demo.atis_parser.api import AtisParserModelEndpoint
from allennlp_demo.common.testing import ModelEndpointTestCase


class TestAtisParserModelEndpoint(ModelEndpointTestCase):
    endpoint = AtisParserModelEndpoint()
    predict_input = {"utterance": "show me the flights from detroit to westchester county"}
