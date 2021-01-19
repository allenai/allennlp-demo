from .api import ModelCardsService


def test_model_cards():
    app = ModelCardsService()
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert len(response.json) > 0
    bidaf = response.json.get("rc-bidaf")
    assert bidaf is not None
    assert bidaf.get("display_name") == "BiDAF"
    assert bidaf.get("contact") == "allennlp-contact@allenai.org"
