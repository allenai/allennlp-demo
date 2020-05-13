<div align="center">
    <img src="https://raw.githubusercontent.com/allenai/allennlp/master/docs/img/allennlp-logo-dark.png" width="400"/>
    <hr/>
</div>

This repository contains the code for the [AllenNLP demo](https://demo.allennlp.org).

We're actively refactoring some bits and pieces of the codebase, you can expect
better documentation to land in the near future.

For more information see the [AllenNLP project](https://github.com/allenai/allennlp).

## Prerequisites

You'll need [Docker](https://www.docker.com/) installed on your local machine.

## Running a Local Environment

The AllenNLP demo at a high level is composed of two components:

1. A JavaScript application for rendering the user-interface. The code for this can be found
   in `ui/`.
2. A series of Python applications that each provide a small HTTP API endpoint for doing interesting
   things with a single model. The code for this can be found in `api/`.

There's three ways to run things locally:

1. If you're working on a single model endpoint consult the
   [README in the api directory](./api/README.md) for more specific instructions.

2. If you're only working on the user-interface, you can start things up by running:

    ```
    docker-compose -f docker-compose.ui-only.yaml up --build
    ```

   Once that's complete you'll be able to access your local version by opening
   [http://localhost:8080](http://localhost:8080) in a browser. Changes to the code should
   be automatically applied.

3. If you'd like to run an end to end environment that includes the user-interface and a model
   endpoint, you can do so by running:

    ```bash
    MODEL=bidaf_elmo OLD_MODEL=reading-comprehension docker-compose up --build
    ```

   The `MODEL` parameter specifies which model in `api/` to spin up, while `OLD_MODEL` tells the old
   application which model it should load.

   Once that's complete load [http://localhost:8080](http://localhost:8080) in the
   browser of your choice.

   Code changes will be automatically applied, while changes to backend or frontend dependencies
   require rerunning `docker-compose`.

