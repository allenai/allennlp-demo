# This is the common Dockerfile that is used to build all demos unless the demo
# overrides this with its own Dockerfile in its directory.
FROM python:3.8

# Ensure allennlp_demo module can be found by Python.
ENV PYTHONPATH /app/

# Ensure log messages written immediately instead of being buffered, which is
# useful if the app crashes so the logs won't get swallowed.
ENV PYTHONUNBUFFERED 1

# Disable parallelism in tokenizers because it doesn't help, and sometimes hurts.
ENV TOKENIZERS_PARALLELISM 0

# Prevent 'allennlp-models' from pinning 'allennlp'
ENV ALLENNLP_VERSION_OVERRIDE allennlp

WORKDIR /app/

# Need latest commits to allennlp and allennlp-models
COPY allennlp_demo/adversarial_binary_gender_bias_mitigated_roberta_snli/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/adversarial_binary_gender_bias_mitigated_roberta_snli allennlp_demo/adversarial_binary_gender_bias_mitigated_roberta_snli

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/adversarial_binary_gender_bias_mitigated_roberta_snli/api.py" ]
