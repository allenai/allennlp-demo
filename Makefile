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

.PHONY : test
test :
	pytest -v --color=yes allennlp_demo/tests/

allennlp_demo/%/Dockerfile : \
		allennlp_demo/common/codegen.py \
		allennlp_demo/%/__init__.py \
		allennlp_demo/%/api.py \
		allennlp_demo/%/test_api.py \
		allennlp_demo/%/model.json \
		allennlp_demo/%/requirements.txt
	@if [ "$$(git ls-files $@ | wc -l)" -ge 1 ]; then \
		echo "$@ tracked by git, leaving untouched"; \
	else \
		echo "Generating $@"; \
		python3.7 allennlp_demo/common/codegen.py $* dockerfile > $@; \
	fi

%-context.tar.gz : \
		allennlp_demo/%/Dockerfile  \
		allennlp_demo/%/__init__.py \
		allennlp_demo/%/api.py \
		allennlp_demo/%/test_api.py \
		allennlp_demo/%/model.json \
		allennlp_demo/%/requirements.txt \
		$(COMMON_SRC)
	tar -czvf $@ $^

%-build : allennlp_demo/%/Dockerfile %-context.tar.gz
	docker build -f $< -t allennlp-demo-$*:$(DOCKER_LABEL) - < $*-context.tar.gz

%-run : %-build
	docker run --rm -p $(DOCKER_PORT):8000 -v $$HOME/.allennlp:/root/.allennlp allennlp-demo-$*:$(DOCKER_LABEL) $(ARGS)

%-test : %-build
	docker run --rm -v $$HOME/.allennlp:/root/.allennlp allennlp-demo-$*:$(DOCKER_LABEL) -m pytest -v --color=yes
