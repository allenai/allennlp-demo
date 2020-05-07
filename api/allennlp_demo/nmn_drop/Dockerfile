FROM allennlp/commit:ff0d44a5e21d5e6256c73b5b9f216a87c5743f91

WORKDIR /app/
COPY allennlp_demo/nmn_drop/requirements.txt allennlp_demo/nmn_drop/requirements.txt
RUN pip install -r allennlp_demo/nmn_drop/requirements.txt

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


WORKDIR /app/

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/nmn_drop allennlp_demo/nmn_drop

# This allows the libraries we just added to `/lib` as well as `/allennlp_demo` to be loaded by name.
ENV PYTHONPATH /lib:/app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/nmn_drop/api.py" ]
