from overrides import overrides

from allennlp_demo.common.testing import RcModelEndpointTestCase
from allennlp_demo.vilbert_vqa.api import VilbertVqaModelEndpoint


class TestVilbertVqaModelEndpoint(RcModelEndpointTestCase):
    endpoint = VilbertVqaModelEndpoint()

    predict_input = {
        "question": "What game are they playing?",
        "image_url": "https://storage.googleapis.com/allennlp-public-data/vqav2/baseball.jpg",
    }

    @overrides
    def check_predict_result(self, result):
        assert len(result) > 0
        for answer in result:
            assert "answer" in answer
            assert "confidence" in answer
            assert 0.0 <= answer["confidence"] <= 100.0
