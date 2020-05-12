FROM allennlp/commit:93024e53c1445cb4630ee5c07926abff8943715f

WORKDIR /app/
COPY allennlp_demo/nlvr_parser/requirements.txt allennlp_demo/nlvr_parser/requirements.txt
ENV EXCLUDE_ALLENNLP_IN_SETUP true
RUN pip install -r allennlp_demo/nlvr_parser/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/nlvr_parser allennlp_demo/nlvr_parser

ENV PYTHONPATH /app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/nlvr_parser/api.py" ]
