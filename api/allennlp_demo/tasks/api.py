"""
The tasks endpoint lists all demo tasks and some info about them.
"""
import logging  # noqa: E402
import flask  # noqa: E402
from werkzeug.exceptions import NotFound

from allennlp_demo.common.logs import configure_logging  # noqa: E402
from allennlp_models.pretrained import get_tasks  # noqa: E402
from allennlp_models.version import VERSION

logger = logging.getLogger(__name__)


class TasksService(flask.Flask):
    def __init__(self, name: str = "info"):
        super().__init__(name)
        configure_logging(self)

        @self.route("/", methods=["GET"])
        def info():
            return flask.jsonify({"id": "tasks", "allennlp_models": VERSION})

        @self.route("/all", methods=["GET"])
        def tasks():
            tasks = get_tasks()
            return flask.jsonify(tasks)

        @self.route("/task/<string:task_id>", methods=["GET"])
        def task(task_id: str):
            for (tid, task) in get_tasks().items():
                if tid == task_id:
                    return flask.jsonify(task)
            raise NotFound(f"No task card with {task_id} found.")


if __name__ == "__main__":
    app = TasksService()
    app.run(host="0.0.0.0", port=8000)
