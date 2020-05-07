SRC = allennlp_demo/
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

%-build :
	@if [ -f allennlp_demo/$*/Dockerfile ]; then \
		echo "Using custom build from allennlp_demo/$*/Dockefile"; \
		docker build \
			-f allennlp_demo/$*/Dockerfile \
			-t allennlp-demo-$*:$(DOCKER_LABEL) .; \
	else \
		echo "Using default build from allennlp_demo/Dockerfile"; \
		docker build \
			--build-arg DEMO=$* \
			-t allennlp-demo-$*:$(DOCKER_LABEL) .; \
	fi

%-run : %-build
	docker run --rm \
		-p $(DOCKER_PORT):8000 \
		-v $$HOME/.allennlp:/root/.allennlp \
		allennlp-demo-$*:$(DOCKER_LABEL)

%-test : %-build
	docker run --rm \
		-v $$HOME/.allennlp:/root/.allennlp \
		--entrypoint=python \
		allennlp-demo-$*:$(DOCKER_LABEL) \
		-m pytest -v --color=yes
