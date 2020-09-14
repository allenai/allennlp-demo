"""
The info service is an endpoint that lists all API endpoints and some additional information
about each. It's purely for discovery, and intended for use primarily by administrators (but is
ok to be public.
"""

# This ensures that third party libs (like requests) use the non-blocking socket,
# so that we actually benefit from using `gevent`. They recommend that it be one of the first
# lines executed in your program, which is why we import these first.
#
# See: http://www.gevent.org/intro.html#monkey-patching
from gevent import monkey

monkey.patch_all()

from dataclasses import dataclass  # noqa: E402
import logging  # noqa: E402
from typing import Optional, Mapping, Any, List  # noqa: E402

import flask  # noqa: E402
from flask_caching import Cache  # noqa: E402
import grequests  # noqa: E402
import kubernetes  # noqa: E402
from requests import Session, adapters  # noqa: E402

from allennlp_demo.common.logs import configure_logging  # noqa: E402


logger = logging.getLogger(__name__)


@dataclass
class Endpoint:
    """
    An individual API endpoint.
    """

    id: str
    url: str
    info: Optional[Mapping[str, Any]]
    commit_sha: Optional[str]
    commit_url: Optional[str]

    @staticmethod
    def from_ingress(ingress: kubernetes.client.ExtensionsV1beta1Ingress) -> Optional["Endpoint"]:
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

        commit_sha = ingress.metadata.annotations.get("apps.allenai.org/sha")
        repo = ingress.metadata.annotations.get("apps.allenai.org/repo")
        if commit_sha is not None and repo is not None:
            commit_url = f"https://github.com/allenai/{repo}/commit/{commit_sha}"
        else:
            commit_url = None

        return Endpoint(id, url, None, commit_sha, commit_url)


class InfoService(flask.Flask):
    def __init__(self, name: str = "info"):
        super().__init__(name)
        configure_logging(self)

        cache = Cache(config={"CACHE_TYPE": "simple"})
        cache.init_app(self)

        # We'll re-use a single HTTP Session to make all of the info requests to our
        # our model endpoints.
        # We set `pool_maxsize` to 100 so that the pool can handle all of the model
        # requests concurrently, potentially from several different incoming requests
        # at once.
        self.session = Session()
        adapter = adapters.HTTPAdapter(pool_maxsize=100)
        self.session.mount("https://", adapter)

        @self.route("/", methods=["GET"])
        @cache.cached(timeout=10)
        def info():
            client = kubernetes.client.ExtensionsV1beta1Api()
            resp = client.list_ingress_for_all_namespaces(label_selector="app=allennlp-demo")

            # Gather endpoints.
            endpoints: List[Endpoint] = []
            info_requests: List[grequests.AsyncRequest] = []
            for ingress in resp.items:
                # Don't try to return information for this service, otherwise we'd recursively
                # call ourselves.
                if ingress.metadata.labels.get("endpoint") == "info":
                    continue
                endpoint = Endpoint.from_ingress(ingress)
                if endpoint is not None:
                    endpoints.append(endpoint)
                    info_requests.append(
                        grequests.request("GET", endpoint.url, session=self.session)
                    )

            # Now join the info HTTP requests concurrently.
            for endpoint, info_resp in zip(
                endpoints,
                grequests.map(info_requests, exception_handler=self.exception_handler),
            ):
                if not info_resp:
                    continue
                endpoint.info = info_resp.json()

            return flask.jsonify(endpoints)

    @staticmethod
    def exception_handler(request: grequests.AsyncRequest, exception) -> None:
        logger.exception("Request to %s failed: %s", request.url, exception)


if __name__ == "__main__":
    kubernetes.config.load_kube_config()
    app = InfoService()
    app.run(host="0.0.0.0", port=8000)
