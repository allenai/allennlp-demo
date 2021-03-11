# LERC API Endpoint

This endpoint exposes a REST API for demonstrating a LERC model trained on MOCHA.
More information can be found [here](https://github.com/anthonywchen/MOCHA).

## Running this Locally

The best way to run this locally is via Docker. 
First build the Docker container:

```bash
docker build -f allennlp_demo/lerc/Dockerfile -t lerc:latest .
```

Then run the test:
```bash
 docker run --rm -it --name lerc --entrypoint python -p 8000:8000 lerc:latest -m pytest allennlp_demo/lerc/test_api.py -s
```

The tests requires about 3GB of memory, so be sure to adjust your Docker settings
