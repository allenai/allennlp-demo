from allennlp_demo.wikitables_parser.api import WikitablesParserModelEndpoint
from allennlp_demo.common.testing import ModelEndpointTestCase


class TestWikitablesParserModelEndpoint(ModelEndpointTestCase):
    endpoint = WikitablesParserModelEndpoint()
    predict_input = {
        "table": "\n".join(
            [
                "Season	Level	Division	Section	Position	Movements",
                "1993	Tier 3	Division 2	Östra Svealand	1st	Promoted",
                "1994	Tier 2	Division 1	Norra	11th	Relegation Playoffs",
                "1995	Tier 2	Division 1	Norra	4th	",
                "1996	Tier 2	Division 1	Norra	11th	Relegation Playoffs - Relegated",
                "1997	Tier 3	Division 2	Östra Svealand	3rd	",
                "1998	Tier 3	Division 2	Östra Svealand	7th	",
                "1999	Tier 3	Division 2	Östra Svealand	3rd	",
                "2000	Tier 3	Division 2	Östra Svealand	9th	",
                "2001	Tier 3	Division 2	Östra Svealand	7th	",
                "2002	Tier 3	Division 2	Östra Svealand	2nd	",
                "2003	Tier 3	Division 2	Östra Svealand	3rd	",
                "2004	Tier 3	Division 2	Östra Svealand	6th	",
                "2005	Tier 3	Division 2	Östra Svealand	4th	Promoted",
                "2006*	Tier 3	Division 1	Norra	5th	",
                "2007	Tier 3	Division 1	Södra	14th	Relegated",
            ]
        ),
        "question": "What is the only season with the 1st position?",
    }
