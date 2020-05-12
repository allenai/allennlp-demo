from allennlp_demo.common.testing import ModelEndpointTestCase
from allennlp_demo.roberta_sentiment_analysis.api import RobertaSentimentAnalysisModelEndpoint


class TestRobertaSentimentAnalysisModelEndpoint(ModelEndpointTestCase):
    endpoint = RobertaSentimentAnalysisModelEndpoint()
    predict_input = {"sentence": "a very well-made, funny and entertaining picture."}
