# AllenNLP Demo

This repository contains the AllenNLP demo.

Here is an example for how to manually build the Docker image and run the demo on port 8000.

```
$ export GIT_HASH=`git log -1 --pretty=format:"%H"`
$ docker build -t allennlp/demo:$GIT_HASH .
$ docker run -p 8000:8000 allennlp/demo:$GIT_HASH
```

Note that the `run` process may get killed prematurely if there is insufficient memory allocated to Docker. As of September 14, 2018, setting a memory limit of 10GB was sufficient to run the demo. See [Docker Docs](https://docs.docker.com/docker-for-mac/#advanced) for more on setting memory allocation preferences.

## Development

To run the demo for development, you will need to:

1. Create a fresh environment:

    ```
    conda create -n allennlp-demo python=3.6
    source activate allennlp-demo
    pip install -r requirements.txt
    ```

2.  Install the version of AllenNLP you would like to use.

    a.  To install the latest release, run `pip install allennlp`.

    b.  If you would like to use the same version this commit was tested on, please look in the
        Dockerfile and install that commit.

        ```
        git+git://github.com/allenai/allennlp.git@$SOURCE_COMMIT`.
        ```

    c.  To install AllenNLP from source you can use `pip install --editable .`

2. Build the frontend and start a development frontend service

    ```
    ./scripts/build_demo.py
    cd demo
    npm run start
    ```

    This will start a frontend service locally, which will hot refresh when you make changes to the JS.

3. Start the backend service

    ```
    ./app.py
    ```

    Normally, the backend server would manage the frontend assets as well - the JS has a special hack for if it is running on port 3000 (which it does by default if you are running the unoptimized JS using `npm run start`), it will look for the backend service at port 8000. Otherwise, it serves the backend and the frontend from the same port.

