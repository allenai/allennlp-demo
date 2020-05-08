"""
Production entry point that launches the gevent WSGI server in place of Flask's
default one.

The workload for this service is entirely I/O bound, so should improve the
service's ability to handle more concurrent connections without using a
multi-process WSGI server like `gunicorn`.
"""
from gevent import monkey, pywsgi

# This ensures third party libs use the non-blocking socket, so that we actually
# benefit from using `gevent`. They recommend that it be one of the first
# lines executed in your program, which is why we import it and immediately
# execute the command.
#
# See: http://www.gevent.org/intro.html#monkey-patching
monkey.patch_all()

from allennlp_demo.permalinks.api import PermaLinkService  # noqa: E402
from allennlp_demo.permalinks.db import PostgresDemoDatabase  # noqa: E402

if __name__ == "__main__":
    db = PostgresDemoDatabase.from_environment()
    app = PermaLinkService(db=db)
    # Note, we set `log=None` to disable the `gevent` request log in favor
    # of ours which includes the info we want.
    server = pywsgi.WSGIServer(("0.0.0.0", 8000), app, log=None, error_log=app.logger)
    server.serve_forever()
