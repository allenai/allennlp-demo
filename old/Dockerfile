# This Dockerfile is used to serve the AllenNLP demo.
FROM allennlp/commit:26e313b7d11eacf3a78c09c34608ad1bfd7db120
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /app

# Install python dependencies
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Download spacy model
RUN spacy download en_core_web_sm

COPY server/models.py server/models.py

COPY app.py app.py
COPY server/ server/

# Copy the configuration files used at runtime
COPY models.json models.json
COPY models_small.json models_small.json

# Optional argument to set an environment variable with the Git SHA
ARG SOURCE_COMMIT
ENV ALLENNLP_DEMO_SOURCE_COMMIT $SOURCE_COMMIT

EXPOSE 8000

ENTRYPOINT ["./app.py"]
CMD ["--demo-dir", "/stage/allennlp/demo"]
