# This is the common Dockerfile that is used to build all demos unless the demo
# overrides this with its own Dockerfile in its directory.
FROM python:3.8

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes so the logs won't get swallowed.
ENV PYTHONUNBUFFERED 1

# Disable parallelism in tokenizers because it doesn't help, and sometimes hurts.
ENV TOKENIZERS_PARALLELISM 0

WORKDIR /app/

COPY allennlp_demo/wikitables_parser/requirements.txt requirements.txt
ENV ALLENNLP_VERSION_OVERRIDE allennlp<2.0.0
RUN pip install -r requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/wikitables_parser/.allennlp_plugins .allennlp_plugins
COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common

# Copy model-specific stuff.
COPY allennlp_demo/wikitables_parser allennlp_demo/wikitables_parser

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/wikitables_parser/api.py" ]
