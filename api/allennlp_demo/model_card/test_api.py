from .api import ModelCardService


def test_model_card():
    app = ModelCardService()
    client = app.test_client()
    response = client.get("/rc-bidaf")
    assert response.status_code == 200
    assert response.json["display_name"] == "BiDAF"
    assert response.json["contact"] == "allennlp-contact@allenai.org"


def task_not_found():
    app = ModelCardService()
    client = app.test_client()
    response = client.get("/✨")
    assert response.status_code == 404
