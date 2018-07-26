# AllenNLP Demo

This repository contains the AllenNLP demo.

Here is an example for how to manually build the Docker image and run the demo on port 8000.

```
$ export GIT_HASH=`git log -1 --pretty=format:"%H"`
$ docker build -t allennlp/demo:$GIT_HASH .
$ docker run -p 8000:8000 allennlp/demo:$GIT_HASH
```
