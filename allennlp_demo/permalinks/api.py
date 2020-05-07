from typing import Optional
import psycopg2
from flask import Flask, Response, jsonify
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound
from allennlp_demo.permalinks.db import DemoDatabase, PostgresDemoDatabase
from allennlp_demo.permalinks.models import slug_to_int
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

        @self.route("/permalink/<string:slug>")
        def get_permalink(slug: str) -> Response:
            """
            Find a permalink by slug.
            """
            # If we don't have a database configured, there are no permalinks.
            if self.db is None:
                raise BadRequest("Permalinks are not enabled")

            perma_id = slug_to_int(slug)
            if perma_id is None:
                # Malformed slug
                raise BadRequest(f"Unrecognized permalink: {slug}")

            # Fetch the results from the database.
            try:
                link = self.db.get_result(perma_id)
            except psycopg2.Error:
                self.logger.exception(f"Unable to get results from database: {perma_id}")
                raise InternalServerError("Database error")

            if link is None:
                raise NotFound(f"Permalink not found: {slug}")

            return jsonify({"requestData": link.request_data})


if __name__ == "__main__":
    db = PostgresDemoDatabase.from_environment()
    app = PermaLinkService(db=db)
    app.run(host="0.0.0.0", port=8000)
