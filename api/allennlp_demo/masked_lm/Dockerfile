FROM allennlp/commit:ff0d44a5e21d5e6256c73b5b9f216a87c5743f91

WORKDIR /app/
COPY allennlp_demo/masked_lm/requirements.txt allennlp_demo/masked_lm/requirements.txt
ENV EXCLUDE_ALLENNLP_IN_SETUP true
RUN pip install -r allennlp_demo/masked_lm/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/masked_lm allennlp_demo/masked_lm

ENV PYTHONPATH /app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/masked_lm/api.py" ]
