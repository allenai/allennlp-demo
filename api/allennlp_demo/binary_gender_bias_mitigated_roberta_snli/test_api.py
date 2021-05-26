from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.binary_gender_bias_mitigated_roberta_snli.api import (
    BinaryGenderBiasMitigatedRobertaSnliModelEndpoint,
)


class TestBinaryGenderBiasMitigatedRobertaSnliModelEndpoint(ModelEndpointTestCase):
    endpoint = BinaryGenderBiasMitigatedRobertaSnliModelEndpoint()
    predict_input = {
        "hypothesis": "An accountant can afford a computer.",
        "premise": "A gentleman can afford a computer.",
    }
