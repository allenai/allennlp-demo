from typing import Dict, List
import json

from allennlp.predictors import Predictor
from allennlp.models.archival import load_archive
# This maps from the name of the task
# to the ``DemoModel`` indicating the location of the trained model
# and the type of the ``Predictor``.  This is necessary, as you might
# have multiple models (for example, a NER tagger and a POS tagger)
# that have the same ``Predictor`` wrapper. The corresponding model
# will be served at the `/predict/<name-of-task>` API endpoint.

class DemoModel:
    """
    A demo model is determined by an archive file (representing the trained model), a
    choice of predictor, and a limit on the maximum request length it can handle.

    The initial max_request_length values were selected by querying the DB for:

        with queries_with_len as (select *, char_length(request_data) as request_len from queries)
            select model_name, max(request_len)/2 as max_lim from queries_with_len
            where response_data is not null
            group by model_name;

    These limits affect less than 1% of queries for each model.
    """
    def __init__(self, archive_file: str, predictor_name: str, max_request_length: int) -> None:
        self.archive_file = archive_file
        self.predictor_name = predictor_name
        self.max_request_length = max_request_length

    def predictor(self) -> Predictor:
        archive = load_archive(self.archive_file)
        return Predictor.from_archive(archive, self.predictor_name)

def load_demo_models(models_file: str,
                     task_names: List[str] = None) -> Dict[str, DemoModel]:
    with open(models_file) as f:
        blob = json.load(f)

    # If no task names specified, load all of them
    task_names = task_names or blob.keys()

    return {task_name: DemoModel(**model)
            for task_name, model in blob.items()
            if task_name in task_names}
