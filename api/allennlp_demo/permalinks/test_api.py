from allennlp_demo.permalinks.db import InMemoryDemoDatabase
from allennlp_demo.permalinks.api import PermaLinkService
from allennlp_demo.permalinks.models import int_to_slug


def test_no_db():
    app = PermaLinkService("testpermalinks", db=None)
    client = app.test_client()
    assert client.get("/permalink/slugzilla").status_code == 400


def test_get_permalink():
    db = InMemoryDemoDatabase()
    app = PermaLinkService("testpermalinks", db)
    client = app.test_client()

    # An invalid slug should result in a 400
    resp = client.get("/permalink/-1")
    assert resp.status_code == 400

    # There's nothing in the db yet, so this should be a 404
    resp = client.get(f"/permalink/{int_to_slug(1)}")
    assert resp.status_code == 404

    # Add something to the database and make sure it comes back
    link_id = db.insert_request("1.1.1.1", "reading-comprehension", {"slug": "zilla"})
    resp = client.get(f"/permalink/{int_to_slug(link_id)}")
    assert resp.status_code == 200
    assert resp.json["requestData"]["slug"] == "zilla"
    assert len(resp.json.keys()) == 1
