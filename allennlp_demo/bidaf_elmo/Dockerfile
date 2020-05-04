# This Dockerfile is specific to the bidaf_elmo model, but is meant to be executed in the
# `allennlp_demo` directory, so that the build context includes common libraries that are
# shared across models.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY bidaf_elmo/requirements.txt bidaf_elmo/requirements.txt
RUN pip install -r bidaf_elmo/requirements.txt

RUN spacy download en_core_web_sm

COPY __init__.py .
COPY common common
COPY bidaf_elmo bidaf_elmo

ENTRYPOINT [ "python" ]
CMD [ "bidaf_elmo/api.py" ]
