# This Dockerfile is used to serve the AllenNLP demo.

FROM allennlp/allennlp:v0.5.1-pip
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /stage/allennlp

# Install npm early so layer is cached when mucking with the demo
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs

# Install postgres binary
RUN pip install psycopg2-binary

# Download spacy and NLTK models
RUN python -m nltk.downloader punkt
RUN spacy download en_core_web_sm

# Cache models early, they're huge
COPY scripts/ scripts/
COPY server/models.py server/models.py
ENV PYTHONPATH=.
RUN ./scripts/cache_models.py

# Now install and build the demo
COPY demo/ demo/
RUN ./scripts/build_demo.py

COPY tests/ tests/
COPY server/ server/

RUN pytest tests/

# Optional argument to set an environment variable with the Git SHA
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT $SOURCE_COMMIT

EXPOSE 8000

ENV ALLENNLP_DEMO_DIRECTORY /stage/allennlp/demo

ENTRYPOINT ["./server/app.py"]
