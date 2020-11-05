from allennlp_demo.permalinks.db import InMemoryDemoDatabase
from allennlp_demo.permalinks.api import PermaLinkService
from allennlp_demo.permalinks.models import int_to_slug


def test_no_db():
    app = PermaLinkService("testpermalinks", db=None)
    client = app.test_client()
    assert client.get("/slugzilla").status_code == 400


def test_get_permalink():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    # An invalid slug should result in a 400
    resp = client.get("/-1")
    assert resp.status_code == 400

    # There's nothing in the db yet, so this should be a 404
    resp = client.get(f"/{int_to_slug(1)}")
    assert resp.status_code == 404

    # Add something to the database and make sure it comes back
    link_id = db.insert_request(model_name="reading-comprehension", request_data={"slug": "zilla"})
    resp = client.get(f"/{int_to_slug(link_id)}")
    assert resp.status_code == 200
    assert resp.json["request_data"]["slug"] == "zilla"


def test_old_create_permalink():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    resp = client.post(
        "/",
        json={
            "model_name": "reading-comprehension",
            "request_data": {
                "model": "BiDAF",
                "passage": "The dog barked.",
                "question": "Did the dog bark?",
            },
        },
    )
    assert resp.status_code == 200
    slug = resp.json
    assert len(slug) != 0

    get_resp = client.get(f"/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json["request_data"]["model"] == "BiDAF"
    assert get_resp.json["request_data"]["passage"] == "The dog barked."
    assert get_resp.json["request_data"]["question"] == "Did the dog bark?"
    assert get_resp.json["model_name"] == "reading-comprehension"
    assert get_resp.json["model_id"] is None
    assert get_resp.json["task_name"] is None


def test_new_create_permalink():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    resp = client.post(
        "/",
        json={
            "model_id": "bidaf",
            "task_name": "reading-comprehension",
            "request_data": {"passage": "The dog barked.", "question": "Did the dog bark?"},
        },
    )
    assert resp.status_code == 200
    slug = resp.json
    assert len(slug) != 0

    get_resp = client.get(f"/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json["request_data"]["passage"] == "The dog barked."
    assert get_resp.json["request_data"]["question"] == "Did the dog bark?"
    assert get_resp.json["model_name"] is None
    assert get_resp.json["model_id"] == "bidaf"
    assert get_resp.json["task_name"] == "reading-comprehension"


def test_create_permalink_no_request_data():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    resp = client.post("/", json={"model_id": "bidaf", "task_name": "reading-comprehension"})
    assert resp.status_code == 400
