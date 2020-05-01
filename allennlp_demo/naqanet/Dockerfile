# This Dockerfile is specific to the naqanet model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the naqanet/ prefix.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY naqanet/requirements.txt naqanet/requirements.txt
RUN pip install -r naqanet/requirements.txt

RUN spacy download en_core_web_sm

COPY common common
COPY naqanet naqanet

ENTRYPOINT [ "python" ]
CMD [ "naqanet/api.py" ]
