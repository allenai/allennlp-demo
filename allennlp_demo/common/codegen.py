#!/usr/bin/env python

"""
This module contains helpers to generate the necessary boilerplate when adding new demos.
"""

import argparse
from dataclasses import dataclass
from typing import Dict, Callable

DEFAULT_ALLENNLP_VERSION = "1.0.0rc3"
"""
Version of AllenNLP to use in the base image.
"""

_DEFAULT_BASE_IMAGE = f"allennlp/allennlp:v{DEFAULT_ALLENNLP_VERSION}"

_DEFAULT_DOCKER_TEMPLATE = """
FROM {base_image}

WORKDIR /app/
COPY allennlp_demo/{demo_name}/requirements.txt allennlp_demo/{demo_name}/requirements.txt
RUN pip install -r allennlp_demo/{demo_name}/requirements.txt

RUN spacy download en_core_web_sm

COPY allennlp_demo/__init__.py allennlp_demo/__init__.py
COPY allennlp_demo/common allennlp_demo/common
COPY allennlp_demo/{demo_name} allennlp_demo/{demo_name}

ENV PYTHONPATH /app/
ENTRYPOINT [ "python" ]
CMD [ "allennlp_demo/{demo_name}/api.py" ]
""".strip()


@dataclass
class Config:
    name: str
    base_image: str = _DEFAULT_BASE_IMAGE

    @classmethod
    def from_opts(cls, opts: argparse.Namespace) -> "Config":
        as_dict = {
            k.replace("-", "_"): v for k, v in vars(opts).items() if k != "file" and v is not None
        }
        return cls(**as_dict)


def generate_dockerfile(config: Config) -> str:
    """
    Generate the Dockerfile for a demo.
    """
    return _DEFAULT_DOCKER_TEMPLATE.format(demo_name=config.name, base_image=config.base_image)


_GENERATORS: Dict[str, Callable[[Config], str]] = {
    "dockerfile": generate_dockerfile,
}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("name", type=str, help="The name of the demo.")
    parser.add_argument(
        "file", type=str, choices=list(_GENERATORS.keys()), help="The file to generate."
    )
    parser.add_argument("--base-image", type=str, help="The base image to use.")
    return parser.parse_args()


def main():
    opts = parse_args()
    generator = _GENERATORS[opts.file]
    config = Config.from_opts(opts)
    print(generator(config))


if __name__ == "__main__":
    main()
