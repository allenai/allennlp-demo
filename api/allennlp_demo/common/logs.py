import os
import sys
import json
import logging
import time
from typing import Mapping

from flask import Flask, request, Response, g
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass(frozen=True)
class RequestLogEntry:
    status: int
    method: str
    path: str
    query: dict
    request_data: Optional[dict]
    response_data: Optional[dict]
    ip: str
    forwarded_for: Optional[str]
    latency_ms: float
    cached: bool


class JsonLogFormatter(logging.Formatter):
    """
    Outputs JSON logs with a structure that works well with Google Cloud Logging.
    """

    def format(self, r: logging.LogRecord) -> str:
        # Exceptions get special handling.
        if r.exc_info is not None:
            # In development we just return the exception with the default formatting, as this
            # is easiest for the end user.
            if os.getenv("FLASK_ENV") == "development":
                return super().format(r)

            # Otherwise we still output them as JSON
            m = r.getMessage() % r.__dict__
            return json.dumps(
                {
                    "logname": r.name,
                    "severity": r.levelname,
                    "message": m,
                    "exception": self.formatException(r.exc_info),
                    "stack": self.formatStack(r.stack_info),
                }
            )
        if isinstance(r.msg, Mapping):
            return json.dumps({"logname": r.name, "severity": r.levelname, **r.msg})
        else:
            m = r.getMessage() % r.__dict__
            return json.dumps({"logname": r.name, "severity": r.levelname, "message": m})


def configure_logging(app: Flask, log_payloads: bool = False):
    """
    Setup logging in a way that makes sense for demo API endpoints.
    """

    # Reduce chatter from AllenNLP
    logging.getLogger("allennlp").setLevel(logging.WARN)

    # Output logs as JSON
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())
    logging.basicConfig(level=os.getenv("LOG_LEVEL", logging.INFO), handlers=[handler])

    # Disable the default request log, as we add our own
    logging.getLogger("werkzeug").setLevel(logging.WARN)

    # Capture when a request is received so that we can keep track of how long it took to process.
    @app.before_request
    def capture_start_time() -> None:
        g.start = time.perf_counter()

    # Output a request log our own with information we're interested in.
    @app.after_request
    def log_request(r: Response) -> Response:
        latency_ms = (time.perf_counter() - g.start) * 1000
        rl = RequestLogEntry(
            r.status_code,
            request.method,
            request.path,
            request.args,
            None if not log_payloads else request.get_json(silent=True),
            None if not log_payloads else r.get_json(silent=True),
            request.remote_addr,
            request.headers.get("X-Forwarded-For"),
            latency_ms,
            r.headers.get("X-Cache-Hit", "0") == "1",
        )
        logging.getLogger("request").info(asdict(rl))
        return r
