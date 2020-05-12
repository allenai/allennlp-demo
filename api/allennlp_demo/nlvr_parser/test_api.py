from allennlp_demo.nlvr_parser.api import NlvrParserModelEndpoint
from allennlp_demo.common.testing import ModelEndpointTestCase


class TestNlvrParserModelEndpoint(ModelEndpointTestCase):
    endpoint = NlvrParserModelEndpoint()
    predict_input = {
        "sentence": "there is exactly one yellow object touching the edge",
        "structured_rep": [
            [
                {"y_loc": 13, "type": "square", "color": "Yellow", "x_loc": 13, "size": 20},
                {"y_loc": 20, "type": "triangle", "color": "Yellow", "x_loc": 44, "size": 30},
                {"y_loc": 90, "type": "circle", "color": "#0099ff", "x_loc": 52, "size": 10},
            ],
            [
                {"y_loc": 57, "type": "square", "color": "Black", "x_loc": 17, "size": 20},
                {"y_loc": 30, "type": "circle", "color": "#0099ff", "x_loc": 76, "size": 10},
                {"y_loc": 12, "type": "square", "color": "Black", "x_loc": 35, "size": 10},
            ],
            [
                {"y_loc": 40, "type": "triangle", "color": "#0099ff", "x_loc": 26, "size": 20},
                {"y_loc": 70, "type": "triangle", "color": "Black", "x_loc": 70, "size": 30},
                {"y_loc": 19, "type": "square", "color": "Black", "x_loc": 35, "size": 10},
            ],
        ],
    }
