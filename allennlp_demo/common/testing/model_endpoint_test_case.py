import os
from pathlib import Path
from unittest import TestCase
from typing import Optional

from flask.testing import FlaskClient

from allennlp_demo.common.http import ModelEndpoint


class ModelEndpointTestCase(TestCase):
    """
    A base class to run model endpoint tests.

    Each endpoint should have a corresponding test class that derives from this.
    """

    PROJECT_ROOT: Path = (Path(__file__).parent / os.pardir / os.pardir / os.pardir).resolve()

    endpoint: ModelEndpoint
    """
    Should be defined by each subclass.
    """

    _client: Optional[FlaskClient] = None

    @property
    def client(self) -> FlaskClient:
        if self._client is None:
            self._client = self.endpoint.app.test_client()
        return self._client
