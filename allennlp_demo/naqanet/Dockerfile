# This Dockerfile is specific to the naqanet model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the naqanet/ prefix.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY allennlp_demo/naqanet/requirements.txt naqanet/requirements.txt
RUN pip install -r naqanet/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py .
COPY allennlp_demo/common common
COPY allennlp_demo/naqanet naqanet

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /

ENTRYPOINT [ "python" ]
CMD [ "naqanet/api.py" ]
