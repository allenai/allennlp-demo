FROM allennlp/commit:ff0d44a5e21d5e6256c73b5b9f216a87c5743f91

WORKDIR /app/
COPY allennlp_demo/lerc/requirements.txt allennlp_demo/lerc/requirements.txt
RUN pip install -r allennlp_demo/lerc/requirements.txt

# There's some extra code we need. We put it here so it's separated from the
# demo code.
WORKDIR /lib

# TODO: We should convert `nmn-drop` into a package we can install via
# `pip install` instead.
RUN git clone https://github.com/anthonywchen/MOCHA.git MOCHA && \
    ln -s MOCHA/lerc .

WORKDIR /app/

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/lerc allennlp_demo/lerc

# This allows the libraries we just added to `/lib` as well as `/allennlp_demo` to be loaded by name.
ENV PYTHONPATH /lib:/app/

ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/lerc/api.py" ]
