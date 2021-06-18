from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.adversarial_binary_gender_bias_mitigated_roberta_snli.api import (
    AdversarialBinaryGenderBiasMitigatedRobertaSnliModelEndpoint,
)


class TestAdversarialBinaryGenderBiasMitigatedRobertaSnliModelEndpoint(ModelEndpointTestCase):
    endpoint = AdversarialBinaryGenderBiasMitigatedRobertaSnliModelEndpoint()
    predict_input = {
        "premise": "An accountant can afford a computer.",
        "hypothesis": "A gentleman can afford a computer.",
    }
