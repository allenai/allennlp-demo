import os
import sys
import json
import logging
import time

from flask import Flask, request, Request, Response, g
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass(frozen=True)
class RequestLogEntry():
    status: int
    method: str
    path: str
    query: dict
    ip: str
    forwarded_for: Optional[str]
    time: float
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
                return self.formatException(r.exc_info)

            # Otherwise we still output them as JSON
            return json.dumps({ "logname": r.name, "severity": r.levelname,
                                "message": r.getMessage(),
                                "exception": self.formatException(r.exc_info),
                                "stack": self.formatStack(r.stack_info) })
        m = r.msg
        if not isinstance(m, str):
            return json.dumps({ "logname": r.name, "severity": r.levelname, **m })
        else:
            return json.dumps({ "logname": r.name, "severity": r.levelname, "message": m })

def init(app: Flask):
    """
    Setup logging in a way that makes sense for demo API endpoints.
    """

    # Reduce chatter from AllenNLP
    logging.getLogger("allennlp").setLevel(logging.WARN)

    # Output logs as JSON
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())
    logging.basicConfig(level=os.getenv('LOG_LEVEL', logging.INFO), handlers=[handler])

    # Disable the default request log, as we add our own
    logging.getLogger("werkzeug").setLevel(logging.WARN)

    # Capture when a request is received so that we can keep track of how long it took to process.
    @app.before_request
    def capture_start_time() -> None:
        g.start = time.perf_counter()

    # Output a request log our own with information we're interested in.
    @app.after_request
    def log_request(r: Response) -> Response:
        t = time.perf_counter() - g.start
        rl = RequestLogEntry(r.status_code, request.method, request.path, request.args,
                             request.remote_addr, request.headers.get('X-Forwarded-For'), t,
                             r.headers.get('X-Cache-Hit', "0") == "1")
        logging.getLogger("request").info(asdict(rl))
        return r

