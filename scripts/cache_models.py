#!/usr/bin/env python

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(__file__, os.pardir))))

from allennlp.common.file_utils import cached_path
from server.models import MODELS

print(f"Downloading {len(MODELS)} models.")
for i, (model, demo_model) in enumerate(MODELS.items()):
    url = demo_model.archive_file
    print(f"Instantiating {model} model from {url}")
    _ = demo_model.predictor()
