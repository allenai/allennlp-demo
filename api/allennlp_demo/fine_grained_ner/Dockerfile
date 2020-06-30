# This Dockerfile is specific to the fine-grained-ner model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the fine-grained-ner/ prefix.
FROM allennlp/allennlp:v1.0.0

WORKDIR /app/
COPY allennlp_demo/fine_grained_ner/requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/fine_grained_ner allennlp_demo/fine_grained_ner

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/fine_grained_ner/api.py" ]
