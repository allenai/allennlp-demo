SRC = allennlp_demo/
DOCKER_BASE_NAME = allennlp-demo
DOCKER_TAG = latest
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
			-t $(DOCKER_BASE_NAME)-$*:$(DOCKER_TAG) .; \
	else \
		echo "Using default build from allennlp_demo/Dockerfile"; \
		docker build \
			--build-arg MODULE=$* \
			-t $(DOCKER_BASE_NAME)-$*:$(DOCKER_TAG) .; \
	fi

%-run : %-build
	docker run --rm \
		-p $(DOCKER_PORT):8000 \
		-v $$HOME/.allennlp:/root/.allennlp \
		-v $$HOME/.cache/torch:/root/.cache/torch \
		-v $$HOME/nltk_data:/root/nltk_data \
		$(DOCKER_BASE_NAME)-$*:$(DOCKER_TAG)

%-test : %-build
	docker run --rm \
		-v $$HOME/.allennlp:/root/.allennlp \
		-v $$HOME/.cache/torch:/root/.cache/torch \
		-v $$HOME/nltk_data:/root/nltk_data \
		--entrypoint=python \
		$(DOCKER_BASE_NAME)-$*:$(DOCKER_TAG) \
		-m pytest -v --color=yes
