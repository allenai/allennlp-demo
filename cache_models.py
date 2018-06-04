#!/usr/bin/env python

import os
import sys

from allennlp.common.file_utils import cached_path

from models import MODELS
from allennlp.common.file_utils import cached_path
print(f"Downloading {len(MODELS)} models.")
for i, (model, demo_model) in enumerate(MODELS.items()):
    url = demo_model.archive_file
    print(f"Instantiating {model} model from {url}")
    _ = demo_model.predictor()
