# Work in progress

$ export GIT_HASH=`git log -1 --pretty=format:"%H"`
$ docker build -t allennlp/demo:$GIT_HASH .
$ docker run -p 8000:8000 allennlp/demo:$GIT_HASH
