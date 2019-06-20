# This Dockerfile is used to serve the AllenNLP demo.

FROM allennlp/commit:03aa838e078f23e985858bb01b9616ae4fc842a9
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /stage/allennlp

# Install Java.
RUN apt-get update --fix-missing && apt-get install -y openjdk-8-jre

# Install npm early so layer is cached when mucking with the demo
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs

# Install postgres binary
RUN pip install psycopg2-binary
RUN pip install sentry-sdk==0.7.1
RUN pip install python-json-logger

# Download spacy model
RUN spacy download en_core_web_sm

COPY scripts/ scripts/
COPY server/models.py server/models.py
COPY models.json models.json
COPY models_small.json models_small.json

# Now install and build the demo
COPY demo/ demo/
RUN ./scripts/build_demo.py

COPY tests/ tests/
COPY app.py app.py
COPY server/ server/

RUN pytest tests/

# Optional argument to set an environment variable with the Git SHA
ARG SOURCE_COMMIT
ENV ALLENNLP_DEMO_SOURCE_COMMIT $SOURCE_COMMIT

EXPOSE 8000

ENTRYPOINT ["./app.py"]
CMD ["--demo-dir", "/stage/allennlp/demo"]
