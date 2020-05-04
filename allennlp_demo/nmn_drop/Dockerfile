# This Dockerfile is specific to the nmn_drop model, but is meant to be executed in the `allennlp_demo`
# directory, so that the build context includes common libraries that are shared across models.
# This is why paths here include the nmn_drop/ prefix.
FROM allennlp/commit:ff0d44a5e21d5e6256c73b5b9f216a87c5743f91
LABEL maintainer="allennlp-contact@allenai.org"

WORKDIR /allennlp_demo
COPY nmn_drop/requirements.txt nmn_drop/requirements.txt
RUN pip install -r nmn_drop/requirements.txt

RUN spacy download en_core_web_sm
RUN spacy download en_core_web_lg

# There's some extra code we need. We put it here so it's separated from the
# demo code.
WORKDIR /lib

# TODO: We should convert `nmn-drop` into a package we can install via
# `pip install` instead.
RUN git clone https://github.com/nitishgupta/nmn-drop nmn-drop && \
    cd nmn-drop && \
    git checkout 108234c2675e2ba9feb20861082ad70663d7e6b4 && \
    cd .. && \
    ln -s nmn-drop/semqa . && \
    ln -s nmn-drop/utils . && \
    ln -s nmn-drop/datasets . && \
    ln -s nmn-drop/pattn2count_ckpt .

# This allows the libraries we just added to `/lib` to be loaded by name.
ENV PYTHONPATH /lib

WORKDIR /allennlp_demo

COPY __init__.py .
COPY common common
COPY nmn_drop nmn_drop

ENTRYPOINT [ "python" ]
CMD [ "nmn_drop/api.py" ]
