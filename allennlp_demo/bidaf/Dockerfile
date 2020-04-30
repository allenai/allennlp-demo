# This Dockerfile is specific to the bidaf model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the bidaf/ prefix.
FROM python:3.7.7-stretch
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY bidaf/requirements.txt bidaf/requirements.txt
RUN pip install -r bidaf/requirements.txt

RUN spacy download en_core_web_sm

COPY . .

ENTRYPOINT [ "python" ]
CMD [ "bidaf/api.py" ]
