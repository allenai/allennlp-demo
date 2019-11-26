USERNAME := $(shell whoami 2> /dev/null)
# Use a default value of `nobody` if variable is empty
USERNAME := $(or $(USERNAME),$(USERNAME),nobody)

export GIT_HASH=`git log -1 --pretty=format:"%H"`

IMAGE_VERSION=${GIT_HASH}
REGISTRY_URL=images.borgy.elementai.net
IMAGE_NAME=allennlp/demo
IMAGE_NAME_AND_TAG=${REGISTRY_URL}/${USERNAME}/${IMAGE_NAME}:${IMAGE_VERSION}

build:
	docker build -t ${IMAGE_NAME_AND_TAG} .

push:
	docker push ${IMAGE_NAME_AND_TAG}

run:
	docker run -p 8000:8000 \
		-v /mnt/projects/eai-nlp/data/allennlp/.allennlp/:/root/.allennlp \
		--rm \
		${IMAGE_NAME_AND_TAG} \
		--model sentiment-analysis