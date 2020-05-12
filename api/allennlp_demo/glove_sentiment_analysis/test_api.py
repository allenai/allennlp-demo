from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.glove_sentiment_analysis.api import GloveSentimentAnalysisModelEndpoint


class TestGloveSentimentAnalysisModelEndpoint(ModelEndpointTestCase):
    endpoint = GloveSentimentAnalysisModelEndpoint()
    predict_input = {"sentence": "a very well-made, funny and entertaining picture."}
