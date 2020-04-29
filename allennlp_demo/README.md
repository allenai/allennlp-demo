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

To build an image for a single model, run the command below, replacing `bidaf`
with the model you'd like to build:


```bash
cd allennlp_demo
docker build -f bidaf/Dockerfile -t allennlp-demo-bidaf:latest .
```

The build must be executed in the `allennlp_demo` directory. This is a temporary
necessity that'll go away once we finish migrating.

You can run that image locally like so:

```
docker run --rm -it -p 8000:8000 \
    -v $HOME/.allennlp:/.root/.allennlp \
    allennlp-demo-bidaf:latest
```

## Local Development

You can use [Miniconda](https://docs.conda.io/en/latest/miniconda.html) to
setup an environment for local development:

```
conda create -n allennlp-demo-bidaf python=3.6.10
conda activate allennlp-demo-bidaf
pip install -r bidaf/requirements.txt
FLASK_ENV=development python bidaf/api.py
```

This will start a server listening at [http://localhost:8000](http://localhost:8000)
that's restarted whenever you change the code.

