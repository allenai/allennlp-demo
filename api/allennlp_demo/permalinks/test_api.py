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
    link_id = db.insert_request("1.1.1.1", "reading-comprehension", {"slug": "zilla"})
    resp = client.get(f"/{int_to_slug(link_id)}")
    assert resp.status_code == 200
    assert resp.json["requestData"]["slug"] == "zilla"
    assert len(resp.json.keys()) == 1


def test_create_permalink():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    resp = client.post(
        "/",
        json={
            "model_name": "bidaf",
            "request_data": {"passage": "The dog barked.", "question": "Did the dog bark?"},
        },
    )
    assert resp.status_code == 200
    slug = resp.json
    assert len(slug) != 0

    get_resp = client.get(f"/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json["requestData"]["passage"] == "The dog barked."
    assert get_resp.json["requestData"]["question"] == "Did the dog bark?"
