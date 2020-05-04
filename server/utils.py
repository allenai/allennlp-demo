from flask import Response


def with_no_cache_headers(request: Response) -> Response:
    """
    Returns the provided request with the appropriate HTTP headers for
    disabling browser caches.
    """
    # Remove the Last-Modified and ETag headers, since they encourage browsers
    # to issue 304 requests (which can result in a cached response).
    del request.headers["Last-Modified"]
    del request.headers["ETag"]

    # Explicitly prevent browsers (and proxies) from caching the response.
    request.headers["Expires"] = "0"
    request.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return request
