import pytest

from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.next_token_lm.api import NextTokenLmModelEndpoint


class TestNextTokenLmModelEndpoint(ModelEndpointTestCase):
    endpoint = NextTokenLmModelEndpoint()
    predict_input = {"sentence": "AlleNLP is a"}

    @pytest.mark.parametrize(
        "input_text, result",
        [
            (
                "AllenNLP is one  of  the  most  popular ",
                "AllenNLP is one of the most popular",
            ),
            ("AllenNLP is a framework.\n", "AllenNLP is a framework.\n"),
            ("AllenNLP is a framework.\t", "AllenNLP is a framework."),
        ],
    )
    def test_sanitize_input_text(self, input_text: str, result: str):
        assert self.endpoint._sanitize_input_text(input_text) == result
