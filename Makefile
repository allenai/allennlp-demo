SRC = app.py scripts/ server/ allennlp_demo/ tests/

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
