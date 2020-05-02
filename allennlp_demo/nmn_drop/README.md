# NMN Reading Comprehension API Endpoint

This endpoint exposes a REST API for demonstrating a NMN trained on DROP for reasoning over text.
More information can be found [here](https://github.com/nitishgupta/nmn-drop).

## Running this Locally

The best way to run this locally is via docker:

```bash
docker build -f nmn_drop/Dockerfile -t nmn:latest && \
    docker run --rm -it --name nmn -p 8000:8000 nmn:latest
```

If the server is already running, you can use this command to run the tests:

```bash
docker exec --it nmn pytest
```

If it's not, you can run them like so:

```bash
docker
docker build -f nmn_drop/Dockerfile -t nmn:latest && \
    docker run --rm -it --name nmn --entrypoint pytest 8000:8000 nmn:latest nmn_drop
```
