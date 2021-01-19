"""
The tasks endpoint lists all demo tasks and some info about them.
"""
import logging
import flask

from allennlp_demo.common.logs import configure_logging
from allennlp_models.pretrained import get_tasks

logger = logging.getLogger(__name__)


class TasksService(flask.Flask):
    def __init__(self, name: str = "tasks"):
        super().__init__(name)
        configure_logging(self)

        @self.route("/", methods=["GET"])
        def tasks():
            tasks = get_tasks()
            return flask.jsonify(tasks)


if __name__ == "__main__":
    app = TasksService()
    app.run(host="0.0.0.0", port=8000)
