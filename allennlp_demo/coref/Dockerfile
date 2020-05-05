# This Dockerfile is specific to the coreference model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the coref/ prefix.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
RUN ls
COPY allennlp_demo/coref/requirements.txt coref/requirements.txt
RUN pip install -r coref/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py .
COPY allennlp_demo/common common
COPY allennlp_demo/coref constituency_parser

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /

ENTRYPOINT [ "python" ]
CMD [ "constituency-parser/api.py" ]
