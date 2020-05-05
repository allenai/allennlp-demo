FROM allennlp/allennlp:v1.0.0rc3

WORKDIR /app/
COPY allennlp_demo/nanaqanet/requirements.txt allennlp_demo/nanaqanet/requirements.txt
RUN pip install -r allennlp_demo/nanaqanet/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/nanaqanet allennlp_demo/nanaqanet

ENV PYTHONPATH /app/
ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/nanaqanet/api.py" ]
