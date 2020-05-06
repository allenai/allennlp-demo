FROM allennlp/allennlp:v1.0.0rc3
ARG DEMO

WORKDIR /app/
COPY allennlp_demo/requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/${DEMO} allennlp_demo/${DEMO}

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes.
ENV PYTHONUNBUFFERED 1

ENV DEMO ${DEMO}
ENTRYPOINT [ "/bin/bash" ]
CMD [ "-c", "python allennlp_demo/${DEMO}/api.py" ]
