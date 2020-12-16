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

    @pytest.mark.parametrize(
        "output, result",
        [
            (
                {
                    "top_indices": [
                        [50256, 50256, 50256, 50256, 50256],
                        [679, 318, 262, 1772, 286],
                        [679, 318, 257, 2888, 286],
                        [679, 318, 635, 257, 2888],
                        [679, 318, 635, 262, 1772],
                    ],
                    "probabilities": [
                        0.1311192363500595,
                        0.00410857517272234,
                        0.002775674918666482,
                        0.0008492876659147441,
                        0.00035627084434963763,
                    ],
                    "top_tokens": [
                        [
                            "<|endoftext|>",
                            "<|endoftext|>",
                            "<|endoftext|>",
                            "<|endoftext|>",
                            "<|endoftext|>",
                        ],
                        ["ĠHe", "Ġis", "Ġthe", "Ġauthor", "Ġof"],
                        ["ĠHe", "Ġis", "Ġa", "Ġmember", "Ġof"],
                        ["ĠHe", "Ġis", "Ġalso", "Ġa", "Ġmember"],
                        ["ĠHe", "Ġis", "Ġalso", "Ġthe", "Ġauthor"],
                    ],
                },
                {
                    "top_indices": [
                        [679, 318, 262, 1772, 286],
                        [679, 318, 257, 2888, 286],
                        [679, 318, 635, 257, 2888],
                        [679, 318, 635, 262, 1772],
                    ],
                    "probabilities": [
                        0.00410857517272234,
                        0.002775674918666482,
                        0.0008492876659147441,
                        0.00035627084434963763,
                    ],
                    "top_tokens": [
                        ["ĠHe", "Ġis", "Ġthe", "Ġauthor", "Ġof"],
                        ["ĠHe", "Ġis", "Ġa", "Ġmember", "Ġof"],
                        ["ĠHe", "Ġis", "Ġalso", "Ġa", "Ġmember"],
                        ["ĠHe", "Ġis", "Ġalso", "Ġthe", "Ġauthor"],
                    ],
                },
            )
        ],
    )
    def test_sanitize_outputs(self, output, result):
        assert self.endpoint._sanitize_outputs(output) == result
