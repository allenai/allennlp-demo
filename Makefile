SRC = app.py scripts/ server/ allennlp_demo/ tests/
DEMO_SRCS = $(shell find allennlp_demo -type f ! -name '*.pyc' ! -path '*.mypy_cache/*')

.PHONY : lint
lint :
	flake8 $(SRC)
	black --check $(SRC)

.PHONY : typecheck
typecheck :
	mypy $(SRC) \
		--ignore-missing-imports \
		--no-strict-optional \
		--no-site-packages \
		--cache-dir=/dev/null

allennlp_demo/%/Dockerfile : context.tar.gz FORCE
	docker build -f $@ -t allennlp-demo-$*:latest - < context.tar.gz
	docker run --rm -it -p 8000:8000 -v $$HOME/.allennlp:/root/.allennlp allennlp-demo-$*:latest $(ARGS)

context.tar.gz : FORCE
	tar -czvf $@ $(DEMO_SRCS)

FORCE :
