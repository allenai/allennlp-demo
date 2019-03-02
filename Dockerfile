# This Dockerfile is used to serve the AllenNLP demo.

FROM allennlp/commit:31af01e0db7ac401b6c4923d5badd7de2691d6a2
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /stage/allennlp

# Install Java.
RUN echo "deb http://http.debian.net/debian jessie-backports main" >>/etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y -t jessie-backports openjdk-8-jdk

# Install npm early so layer is cached when mucking with the demo
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs

# Install postgres binary
RUN pip install psycopg2-binary
RUN pip install sentry-sdk==0.7.1

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

RUN pytest tests/

# Optional argument to set an environment variable with the Git SHA
ARG SOURCE_COMMIT
ENV ALLENNLP_DEMO_SOURCE_COMMIT $SOURCE_COMMIT

EXPOSE 8000

ENV ALLENNLP_DEMO_DIRECTORY /stage/allennlp/demo

ENTRYPOINT ["./app.py"]
