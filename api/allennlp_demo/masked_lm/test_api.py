from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.masked_lm.api import MaskedLmModelEndpoint


class TestMaskedLmModelEndpoint(ModelEndpointTestCase):
    endpoint = MaskedLmModelEndpoint()
    predict_input = {"sentence": "The doctor ran to the emergency room to see [MASK] patient."}
