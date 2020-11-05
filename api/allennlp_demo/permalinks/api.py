from typing import Optional

import psycopg2

from flask import Flask, Response, jsonify, request
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from allennlp_demo.permalinks.db import DemoDatabase, PostgresDemoDatabase
from allennlp_demo.permalinks.models import slug_to_int, int_to_slug
from allennlp_demo.common.logs import configure_logging


class PermaLinkService(Flask):
    def __init__(self, name: str = "permalinks", db: Optional[DemoDatabase] = None):
        super().__init__(name)
        configure_logging(self)

        self.db = db
        if db is None:
            self.logger.warning("No database, permalinks are disabled.")

        @self.errorhandler(BadRequest)
        def handle_400(err: BadRequest):
            return jsonify({"error": str(err)}), 400

        @self.errorhandler(InternalServerError)
        def handle_500(err: InternalServerError) -> Response:
            self.logger.error(err)
            return jsonify({"error": "Something went wrong."}), 500

        @self.route("/", methods=["GET"])
        def info():
            """
            The simplest of info routes. We can add more here later.
            """
            return jsonify({"id": "permalinks"})

        @self.route("/<string:slug>")
        def get_permalink(slug: str) -> Response:
            """
            Find a permalink by slug.
            """
            # If we don't have a database configured, there are no permalinks.
            if self.db is None:
                raise BadRequest("Permalinks are not enabled")

            link_id = slug_to_int(slug)
            if link_id is None:
                # Malformed slug
                raise BadRequest(f"Unrecognized permalink: {slug}")

            # Fetch the results from the database.
            try:
                link = self.db.get_result(link_id)
            except psycopg2.Error:
                self.logger.exception(f"Unable to get results from database: {link_id}")
                raise InternalServerError("Database error")

            if link is None:
                raise NotFound(f"Permalink not found: {slug}")

            return jsonify(link._asdict())

        @self.route("/", methods=["POST"])
        def create_permalink() -> Response:
            """
            Creates a new permalink.
            """
            # If we don't have a database configured, there are no permalinks.
            if self.db is None:
                raise BadRequest("Permalinks are not enabled")

            request_data = request.json.get("request_data")
            if not request_data:
                raise BadRequest("Invalid request_data")

            # Old models send this field. New models do not.
            # TODO: Remove this once all models use the new serving mechanism.
            model_name = request.json.get("model_name")

            # New models send these fields, but old models do not.
            # TODO: Once all models are served via the new mechanism these should be required.
            model_id = request.json.get("model_id")
            task_name = request.json.get("task_name")

            try:
                id = self.db.insert_request(
                    model_name=model_name,
                    request_data=request_data,
                    model_id=model_id,
                    task_name=task_name,
                )
                return jsonify(int_to_slug(id))
            except psycopg2.Error as err:
                self.logger.exception("Error saving permalink: %s", err)
                raise InternalServerError("Unable to create permalink")

        # noop post for image upload, we need an endpoint, but we don't need to save the image
        @self.route("/noop", methods=["POST"])
        def noop():
            return ""


if __name__ == "__main__":
    db = PostgresDemoDatabase.from_environment()
    app = PermaLinkService(db=db)
    app.run(host="0.0.0.0", port=8000)
