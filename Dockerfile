# This Dockerfile is meant for downstream use of AllenNLP.
# It creates an environment that includes a pip installation of allennlp.

FROM python:3.6.3-jessie
LABEL maintainer="allennlp-contact@allenai.org"

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

ENV PATH /usr/local/nvidia/bin/:$PATH
ENV LD_LIBRARY_PATH /usr/local/nvidia/lib:/usr/local/nvidia/lib64

# Tell nvidia-docker the driver spec that we need as well as to
# use all available devices, which are mounted at /usr/local/nvidia.
# The LABEL supports an older version of nvidia-docker, the env
# variables a newer one.
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
LABEL com.nvidia.volumes.needed="nvidia_driver"

WORKDIR /stage/allennlp

# Install npm early so layer is cached when mucking with the demo
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs

# Install allennlp early so layer is cached when mucking with the demo
ARG allennlp_version
RUN if [ -z $allennlp_version ]; then pip install allennlp; else pip install allennlp==$allennlp_version; fi

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

EXPOSE 8000

ENTRYPOINT ["./server/app.py"]
