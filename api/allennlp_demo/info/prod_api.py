"""
Production entry point that launches the gevent WSGI server in place of Flask's
default one.

The workload for this service is entirely I/O bound, so should improve the
service's ability to handle more concurrent connections without using a
multi-process WSGI server like `gunicorn`.
"""
from gevent import monkey, pywsgi

monkey.patch_all()

import kubernetes  # noqa: E402

from allennlp_demo.info.api import InfoService  # noqa: E402


if __name__ == "__main__":
    kubernetes.config.load_incluster_config()
    app = InfoService()
    # Note, we set `log=None` to disable the `gevent` request log in favor
    # of ours which includes the info we want.
    server = pywsgi.WSGIServer(("0.0.0.0", 8000), app, log=None, error_log=app.logger)
    server.serve_forever()
