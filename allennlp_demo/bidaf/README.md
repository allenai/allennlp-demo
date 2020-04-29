# BIDAF API

This directory contains code responsible for providing an HTTP API for querying BIDAF provided
predictions for reading-comprehension style questions.

The API is used by the [AllenNLP demo](https://demo.allennlp.org).

## Getting Started

1. Install [conda](...) and create a new environment:

    ```bash
    conda create -n bidaf python=3.6.10
    ```

2. Start the API:

    ```bash
    conda activate bidaf
    python api.py
    ```

3. Make sure it's working:

    ```bash
    curl http://localhost:8000
    ```
