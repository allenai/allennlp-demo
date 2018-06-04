#!/usr/bin/env python

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(__file__, os.pardir))))

from models import MODELS
from allennlp.common.file_utils import cached_path
print("CACHE_MODELS is '%s'.  Downloading %i models." % (value, len(MODELS)))
for i, (model, url) in enumerate(MODELS.items()):
    print("Downloading '%s' model from %s" % (model, url))
    print("Saved at %s" % cached_path(url))
