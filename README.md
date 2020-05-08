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

The AllenNLP demo at a high level is composed of three components:

1. A JavaScript application for rendering a user-interface. The code for this can be found
   in `ui/`.
2. A legacy Python application that provides a HTTP API for using models to do interesting things,
   like predict answers to questions. The code for this can be found in `old/`.
3. A series of Python applications that each provide a small HTTP API endpoint for doing interesting
   things with a single model. The code for this can be found in `api/`.

We're still in the process of refactoring out the code in `old/`. We hope it'll be gone soon.

There's multiple ways to get things running locally. If you're working on a single model endpoint
consult the [README in the api directory](./api/README.md) for more specific instructions.

If you'd like to run an end to end environment that includes the user-interface, you can do so for
a single model like so:

```bash
MODEL=bidaf_elmo OLD_MODEL=reading-comprehension docker-compose up --build
```

The `MODEL` parameter specifies which model in `api/` to spin up, while `OLD_MODEL` tells the old
application which model it should load.

Don't be alarmed if it takes a minute or two the first time you run that command. Future executions
should be much faster. Once it's complete load [http://localhost:8080](http://localhost:8080) in the
browser of your choice.

If you make changes to the code in `ui/` your browser should automatically refresh, at which point you can test your changes. Similarly updates propagate as changes are saved to the endpoints in
`api/`.  Changes to `old/` however require hitting `Ctrl+C` and re-executing the command above.
Soon this won't be necessary as the legacy codebase will be retired.

At this point the UI doesn't actually use any of the new endpoints. This means that with the setup
above you'd only be able to use the BiDAF model with the Reading Comprehension demo. All other
demos won't be executable.

Stay tuned, as we're actively reworking things and this is bound mature a lot in the near future!
