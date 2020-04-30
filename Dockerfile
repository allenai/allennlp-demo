# This Dockerfile is used to serve the AllenNLP demo.

FROM allennlp/commit:2544e598bcea3f30cd99047a49af301b02073d69
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /stage/allennlp

# Install npm early so layer is cached when mucking with the demo
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs

# Install python dependencies
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Download spacy model
RUN spacy download en_core_web_sm

COPY scripts/ scripts/
COPY server/models.py server/models.py

# Now install and build the demo
COPY demo/ demo/
RUN ./scripts/build_demo.py

COPY tests/ tests/
COPY app.py app.py
COPY server/ server/
COPY scibert/ scibert/

# Copy the configuration files used at runtime
COPY models.json models.json
COPY models_small.json models_small.json

# Optional argument to set an environment variable with the Git SHA
ARG SOURCE_COMMIT
ENV ALLENNLP_DEMO_SOURCE_COMMIT $SOURCE_COMMIT

EXPOSE 8000

ENTRYPOINT ["./app.py"]
CMD ["--demo-dir", "/stage/allennlp/demo"]
