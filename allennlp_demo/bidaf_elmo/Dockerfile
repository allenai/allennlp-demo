FROM allennlp/allennlp:v1.0.0rc3

WORKDIR /app/
COPY allennlp_demo/bidaf_elmo/requirements.txt allennlp_demo/bidaf_elmo/requirements.txt
RUN pip install -r allennlp_demo/bidaf_elmo/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/bidaf_elmo allennlp_demo/bidaf_elmo

# Ensure `/allennlp_demo` module can be found by Python.
ENV PYTHONPATH /app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/bidaf_elmo/api.py" ]
