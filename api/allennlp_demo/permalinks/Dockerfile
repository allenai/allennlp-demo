FROM python:3.7

WORKDIR /app/

COPY allennlp_demo/permalinks/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/permalinks allennlp_demo/permalinks

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes so the logs won't get swallowed.
ENV PYTHONUNBUFFERED 1

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/permalinks/prod_api.py" ]
