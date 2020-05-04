# AllenNLP Demo API

This directory contains code for the API endpoints that are required for the
AllenNLP demo.

This code isn't used yet, it's a new approach we're migrating to that allows
demos to run with different dependencies.

## Code Structure

Each directory contains a small [Flask](https://flask.palletsprojects.com/en/1.1.x/)
applications that handles requests intended for a particular model. Every
application should have it's own `Dockerfile`.

Shared code should be added to the `common/` directory. If you're changing
code in this directory it'll have an effect on all of the endpoints that
use it. We plan on adding tests in the near future as to make it easy to verify
changes to common libaries.

At build time we build each individual endpoint by executing the instructoins
in it's `Dockerfile`. The `Dockerfile` includes the steps that install Python
dependencies and copy over code from `common/` as needed.

## Building

To build and run an image for a single model, run the command below from the root of this repo, replacing `bidaf` with the model you'd like to build:

```bash
make allennlp_demo/bidaf/Dockerfile
```

## Local Development

You can use [Miniconda](https://docs.conda.io/en/latest/miniconda.html) to
setup an environment for local development:

```
conda create -n allennlp-demo-bidaf python=3.7.7
conda activate allennlp-demo-bidaf
pip install -r allennlp_demo/bidaf/requirements.txt
FLASK_ENV=development python allennlp_demo/bidaf/api.py
```

This will start a server listening at [http://localhost:8000](http://localhost:8000)
that's restarted whenever you change the code.

Each endpoint has tests. To run them run `pytest` in the model endpoint's working directory:

```bash
pytest allennlp_demo/bidaf
```
