import math
from overrides import overrides

from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.lerc.api import LERCModelEndpoint


class TestLERCModelEndpoint(ModelEndpointTestCase):
    endpoint = LERCModelEndpoint()

    predict_input = {
        "context": "Robin wept in front of Skylar who was sick of seeing her cry.",
        "question": "What will happen to Robin?",
        "reference": "be scolded",
        "candidate": "be sad",
    }

    @overrides
    def check_predict_result(self, result):
        print(result)
        assert math.isclose(result["pred_score"], 0.223822, abs_tol=1e-5)
