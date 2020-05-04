# This Dockerfile is specific to the bidaf_elmo model, but is meant to be executed in the
# `allennlp_demo` directory, so that the build context includes common libraries that are
# shared across models.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY allennlp_demo/bidaf_elmo/requirements.txt bidaf_elmo/requirements.txt
RUN pip install -r bidaf_elmo/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py .
COPY allennlp_demo/common common
COPY allennlp_demo/bidaf_elmo bidaf_elmo

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /

ENTRYPOINT [ "python" ]
CMD [ "bidaf_elmo/api.py" ]
