# NMN Reading Comprehension API Endpoint

This endpoint exposes a REST API for demonstrating a NMN trained on DROP for reasoning over text.
More information can be found [here](https://github.com/nitishgupta/nmn-drop).

## Running this Locally

The best way to run this locally is via Docker:

```bash
docker build -f nmn_drop/Dockerfile -t nmn:latest && \
    docker run --rm -it --name nmn -p 8000:8000 nmn:latest
```

If the server is already running, you can use this command to run the tests:

```bash
docker exec --it nmn pytest -x -ra
```

If it's not, you can run them like so:

```bash
docker
docker build -f nmn_drop/Dockerfile -t nmn:latest && \
    docker run --rm -it --name nmn --entrypoint pytest 8000:8000 nmn:latest -x -ra nmn_drop
```

The tests require a lot of memory. You may need to adjust your Docker settings to allow up to
11 GB of RAM.
