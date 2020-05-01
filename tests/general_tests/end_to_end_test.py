import json
import logging
import os
import pytest

with open("models.json") as f:
    _model_names = [
        model_name
        for model_name, model_spec in json.load(f).items()
        if "image" not in model_spec    # We don't want to try models pinned to a Docker image.
    ]


@pytest.fixture(scope="module")
def setup():
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(name)s - %(message)s", level=logging.DEBUG
    )
    # Disabling some of the more verbose logging statements that typically aren't very helpful
    # in tests.
    logging.getLogger("allennlp.common.params").disabled = True
    logging.getLogger("allennlp.nn.initializers").disabled = True
    logging.getLogger("allennlp.modules.token_embedders.embedding").setLevel(logging.INFO)
    logging.getLogger("urllib3.connectionpool").disabled = True

    yield

    for filename in ['access.log', 'error.log']:
        try:
            os.remove(filename)
        except FileNotFoundError:
            pass

@pytest.mark.parametrize("model_name", _model_names)
def test_loading(setup, model_name):
    from server.models import load_demo_models
    models = load_demo_models("models.json", [model_name])
    from app import make_app
    app = make_app(models)
    app.testing = True
    client = app.test_client()
    assert client is not None

    # TODO: pass some sample input to the client and make sure the output matches

