# This Dockerfile is specific to the constituency-parser model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the constituency-parser/ prefix.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY allennlp_demo/constituency-parser/requirements.txt constituency-parser/requirements.txt
RUN pip install -r allennlp_demo/constituency-parser/requirements.txt

RUN spacy download en_core_web_sm

COPY __init__.py .
COPY common common
COPY constituency-parser constituency-parser

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /

ENTRYPOINT [ "python" ]
CMD [ "constituency-parser/api.py" ]
