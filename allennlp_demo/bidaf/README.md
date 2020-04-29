# BIDAF API

This directory contains code responsible for providing an HTTP API for querying BIDAF provided
predictions for reading-comprehension style questions.

The API is used by the [AllenNLP demo](https://demo.allennlp.org).

## Getting Started

1. Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) and create a new
   environment:

    ```bash
    conda create -n bidaf python=3.6.10
    conda activate bidaf
    pip install -r requirements.txt
    ```

2. Start the API:

    ```bash
    FLASK_ENV=development python api.py
    ```

3. Make sure it's working:

    ```bash
    curl http://localhost:8000
    ```

You can get predictions like so:

```bash
curl -X POST -H 'Content-Type: application/json' \
    -d '{ "question": "Why do dogs bark?", "passage": "Dogs bark because they like to." }' \
    http://localhost:8000/predict
```
