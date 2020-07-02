FROM allennlp/commit:637dbb159082999c546ac2fc64746b88e5c9d1b5

WORKDIR /app/

COPY allennlp_demo/next_token_lm/requirements.txt requirements.txt
ENV ALLENNLP_VERSION_OVERRIDE=allennlp
RUN pip install -r requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/next_token_lm allennlp_demo/next_token_lm

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes so the logs won't get swallowed.
ENV PYTHONUNBUFFERED 1

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/next_token_lm/api.py" ]
