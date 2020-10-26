# This is the common Dockerfile that is used to build all demos unless the demo
# overrides this with its own Dockerfile in its directory.
FROM allennlp/models:latest

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes so the logs won't get swallowed.
ENV PYTHONUNBUFFERED 1

# Disable parallelism in tokenizers because it doesn't help, and sometimes hurts.
ENV TOKENIZERS_PARALLELISM 0

WORKDIR /app/

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN spacy download en_core_web_sm

COPY .allennlp_plugins .allennlp_plugins
COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common

# Name / sub-directory name of the demo.
ARG MODULE

# Copy model-specific stuff.
COPY allennlp_demo/${MODULE} allennlp_demo/${MODULE}

# You might be wondering why we can't just do
#
#> ENTRYPOINT [ "python" ]
#> CMD [ "allennlp_demo/${MODULE}/api.py" ]
#
# The reason is that Python will interpret the string in CMD literally as just
# "allennlp_demo/${MODULE}/api.py" without substituting environment variables.
# Environment variable evaluation is a something that a shell handles, so we need
# to wrap the `python` command in a shell (`/bin/bash` in this case).
ENV MODULE ${MODULE}
ENTRYPOINT [ "/bin/bash" ]
CMD [ "-c", "python allennlp_demo/${MODULE}/api.py" ]
