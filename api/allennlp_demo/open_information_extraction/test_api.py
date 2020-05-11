from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.open_information_extraction.api import OpenInformationExtractionModelEndpoint


class TestOpenInformationExtractionModelEndpoint(ModelEndpointTestCase):
    endpoint = OpenInformationExtractionModelEndpoint()
    predict_input = {"sentence": "In December, John decided to join the party."}
