from .api import TasksService

def test_tasks():
    app = TasksService()
    client = app.test_client()
    response = client.get("/tasks")
    assert response.status_code == 200
    assert len(response.json.items()) > 0

def test_task():
    app = TasksService()
    client = app.test_client()
    response = client.get("/task/rc")
    assert response.status_code == 200
    assert len(response.json.items()) > 0
    assert response.json["name" ] == "Reading Comprehension"
    assert response.json["id"] == "rc"
    assert len(response.json["examples"].items()) > 0

def task_not_found():
    app = TasksService()
    client = app.test_client()
    response = client.get("/task/✨")
    assert response.status_code == 404

