SRC = app.py scripts/ server/ allennlp_demo/ tests/
COMMON_SRC = $(wildcard allennlp_demo/*.py) \
			 $(wildcard allennlp_demo/common/*.py) \
			 $(wildcard allennlp_demo/common/testing/*.py) \
			 $(wildcard allennlp_demo/common/testing/fixtures/*)
DOCKER_LABEL = latest
DOCKER_PORT = 8000

.PHONY : lint
lint :
	flake8 $(SRC)

.PHONY : format
format :
	black --check $(SRC)
.PHONY : typecheck
typecheck :
	mypy $(SRC) \
		--ignore-missing-imports \
		--no-strict-optional \
		--no-site-packages \
		--cache-dir=/dev/null

%-context.tar.gz : FORCE
	tar -czvf $@ --exclude-from=.dockerignore \
		allennlp_demo/__init__.py \
		allennlp_demo/Dockerfile \
		allennlp_demo/requirements.txt \
		allennlp_demo/entrypoint.sh \
		allennlp_demo/common allennlp_demo/$*/

%-build : %-context.tar.gz
ifeq ($(wildcard allennlp_demo/%/Dockerfile),)
	docker build \
		-f allennlp_demo/Dockerfile \
		-t allennlp-demo-$*:$(DOCKER_LABEL) \
		--build-arg DEMO=$* - < $*-context.tar.gz
else
	docker build \
		-f allennlp_demo/$*/Dockerfile \
		-t allennlp-demo-$*:$(DOCKER_LABEL) \
		- < $*-context.tar.gz
endif

%-run : %-build
	docker run --rm \
		-p $(DOCKER_PORT):8000 \
		-v $$HOME/.allennlp:/root/.allennlp \
		allennlp-demo-$*:$(DOCKER_LABEL) $(ARGS)

%-test : %-build
	docker run --rm \
		-v $$HOME/.allennlp:/root/.allennlp \
		--entrypoint=python \
		allennlp-demo-$*:$(DOCKER_LABEL) \
		-m pytest -v --color=yes

FORCE :
