from .api import TasksService


def test_tasks():
    app = TasksService()
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert len(response.json.items()) > 0
