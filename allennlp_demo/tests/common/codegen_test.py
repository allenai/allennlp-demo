from allennlp_demo.common import codegen


def test_generate_dockerfile():
    config = codegen.Config("bidaf")
    assert (
        codegen.generate_dockerfile(config)
        == """
FROM allennlp/allennlp:v1.0.0rc3

WORKDIR /app/
COPY allennlp_demo/bidaf/requirements.txt allennlp_demo/bidaf/requirements.txt
RUN pip install -r allennlp_demo/bidaf/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/bidaf allennlp_demo/bidaf

ENV PYTHONPATH /app/
ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/bidaf/api.py" ]
    """.strip()
    )
