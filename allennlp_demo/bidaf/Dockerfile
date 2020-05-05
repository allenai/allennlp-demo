FROM allennlp/allennlp:v1.0.0rc3

WORKDIR /app/allennlp_demo
COPY allennlp_demo/bidaf/requirements.txt bidaf/requirements.txt
RUN pip install -r bidaf/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py .
COPY allennlp_demo/common common
COPY allennlp_demo/bidaf bidaf

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/bidaf/api.py" ]
