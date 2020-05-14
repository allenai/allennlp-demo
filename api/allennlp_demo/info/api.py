"""
The info service is an endpoint that lists all API endpoints and some additional information
about each. It's purely for discovery, and intended for use primarily by administrators (but is
ok to be public.
"""
from typing import Optional, Mapping, Any
from dataclasses import dataclass

import flask
import kubernetes
import requests
import logging

from allennlp_demo.common.logs import configure_logging


@dataclass(frozen=True)
class Endpoint:
    """
    An individual API endpoint.
    """

    id: str
    url: str
    info: Optional[Mapping[str, Any]]

    @staticmethod
    def from_ingress(ingress: kubernetes.client.ExtensionsV1beta1Ingress) -> Optional["Endpoint"]:
        logger = logging.getLogger(__name__)

        id = ingress.metadata.labels.get("endpoint")
        if id is None:
            return None

        # We expect an ingres with a single rule that has a single path. If the ingress doesn't
        # match that expectation log an error and return nothing.
        num_rules = len(ingress.spec.rules)
        if num_rules != 1:
            logger.exception(f"Unexpected Ingress with {num_rules} rules")
            return None
        rule = ingress.spec.rules[0]

        paths = rule.http.paths
        num_paths = len(paths)
        if num_paths != 1:
            logger.exception(f"Unexpected Ingress with {num_paths} paths")
            return None
        # The path includes a regular expression that we remove.
        path = paths[0].path.rstrip("(/.*))?$")
        url = f"https://{rule.host}{path}"

        # The root of each endpoint should include some additional information.
        # NOTE: Python is quite slow at this, since this is an I/O bound action. In theory
        # gevent should resolve that, but in practice it doesn't seem to. We could consider
        # using a Thread here, or just rewrite this in language that's better suited for the task.
        resp = requests.get(url)
        if not resp.ok:
            return Endpoint(id, url, None)

        return Endpoint(id, url, resp.json())


class InfoService(flask.Flask):
    def __init__(self, name: str = "info"):
        super().__init__(name)
        configure_logging(self)

        @self.route("/", methods=["GET"])
        def info():
            client = kubernetes.client.ExtensionsV1beta1Api()
            resp = client.list_ingress_for_all_namespaces(label_selector="app=allennlp-demo")
            endpoints = []
            for ingress in resp.items:
                endpoint = Endpoint.from_ingress(ingress)
                if endpoint is not None:
                    endpoints.append(endpoint)
            return flask.jsonify(endpoints)


if __name__ == "__main__":
    kubernetes.config.load_kube_config()
    app = InfoService()
    app.run(host="0.0.0.0", port=8000)
