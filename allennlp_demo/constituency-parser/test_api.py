import pytest

from allennlp_demo.common.testing import ModelEndpointTests
from allennlp_demo.constiency_parser.api import ConstituencyParserModelEndpoint


@pytest.fixture
def client():
    endpoint = ConstituencyParserModelEndpoint()
    return endpoint.app.test_client()


class TestConstituencyParserModelEndpoint(ModelEndpointTests):
    pass
