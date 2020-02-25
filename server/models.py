from typing import Dict, List
import json

from allennlp.predictors import Predictor
from allennlp.models.archival import load_archive
from allennlp.common import util

from server.demo_model import DemoModel
from server.gpt2 import Gpt2DemoModel

# This maps from the name of the task
# to the ``DemoModel`` indicating the location of the trained model
# and the type of the ``Predictor``.  This is necessary, as you might
# have multiple models (for example, a NER tagger and a POS tagger)
# that have the same ``Predictor`` wrapper. The corresponding model
# will be served at the `/predict/<name-of-task>` API endpoint.

def load_demo_models(models_file: str,
                     task_names: List[str] = None,
                     model_names_only: bool = False) -> Dict[str, DemoModel]:
    with open(models_file) as f:
        blob = json.load(f)

    # If no task names specified, load all of them
    task_names = task_names or blob.keys()

    # No models, so return None for everything
    if model_names_only:
        return {task_name: None for task_name in task_names}

    # Otherwise
    demo_models = {}

    for task_name in task_names:
        model = blob[task_name]
        model_type = model.get("type", "allennlp")

        if task_name == "nmn-drop":
            util.import_submodules("semqa")

        # If ever we introduce additional model types,
        # we'll need to add corresponding logic here.
        if model_type == "allennlp":
            load = DemoModel
        elif model_type == "gpt2":
            load = Gpt2DemoModel
        else:
            raise ValueError(f"unknown model type: {model_type}")

        demo_models[task_name] = load(
                    archive_file=model["archive_file"],
                    predictor_name=model["predictor_name"],
                    max_request_length=model["max_request_length"],
                    overrides=model.get("overrides", "")
        )

    return demo_models
