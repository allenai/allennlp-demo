<div align="center">
    <img src="https://raw.githubusercontent.com/allenai/allennlp/master/docs/img/allennlp-logo-dark.png" width="400"/>
    <hr/>
</div>

This repository contains the code for the [AllenNLP demo](https://demo.allennlp.org), a web 
application that demonstrates the capabilities of [AllenNLP](https://github.com/allenai/allennlp),
an open source library for NLP research.

## Getting Started

First, make sure you have [Docker](https://www.docker.com/) and [Python 3](https://www.python.org/) 
installed. After that's complete, you can start things by running this command:

```
./demo start
```

This will start a local instance of the UI and a reverse proxy that forwards API requests
to [production](https://demo.allennlp.org). After this command succeeds, you should be able to
open [http://localhost:8080](http://localhost:8080) in a browser and see a fully functional 
version of the demo.

If you're only working on the UI, you don't need to do anything else. As you make changes
to the code they'll be automatically applied. While you're working you'll probably want to
stream the logs from the UI container to your terminal, so you can see errors when they
occur:

```
docker logs --follow ui
```

By default the demo will send requests to API endpoints running in production. If you'd like to 
run an endpoint locally, just run the start command with the ID of the endpoint:

```
./demo start bidaf
```

This will build and start that endpoint and update the reverse proxy configuration so that
requests for that model are routed to your local machine instead of the production site. 

Change to the Python code related to that endpoint will automatically be applied. Again, you'll 
probably want to view the logs output by the container while working on it, which you can do like 
so:

```
./demo logs --follow bidaf
```

The `./demo` command provides a bunch of other useful commands. You can see full usage information
like so:

```
./demo --help
```


