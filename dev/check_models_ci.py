"""
Script to verify that all demo models are covered by CI in our GitHub Actions workflow.
"""

import yaml
import os
from typing import Iterable


WORKFLOW_FILE_PATH = ".github/workflows/ci.yml"


def find_models() -> Iterable[str]:
    for name in os.listdir("api/allennlp_demo"):
        if name.startswith("."):
            continue
        path = os.path.join("api/allennlp_demo/", name)
        if not os.path.isdir(path):
            continue
        config_path = os.path.join(path, "model.json")
        if not os.path.isfile(config_path):
            continue
        yield name


def main():
    with open(WORKFLOW_FILE_PATH) as workflow_file:
        workflow = yaml.load(workflow_file, Loader=yaml.FullLoader)
    tested_models = set(
        workflow["jobs"]["endpoint_test"]["strategy"]["matrix"]["model"]
    )
    all_models = set(find_models())
    for model in all_models:
        assert model in tested_models, (
            f"test for '{model}' model not found in {WORKFLOW_FILE_PATH}. "
            f"Did you forget to add '{model}' to the 'Endpoint Test' model matrix?"
        )
    for model in tested_models:
        assert model in all_models, (
            f"'{model}' is in the GitHub Actions 'Endpoint Test' job, but does not "
            f"appear to correspond to an actual demo model in 'api/allennlp_demo'. "
            f"Did you forget to delete '{model}' from the 'Endpoint Test' model matrix?"
        )


if __name__ == "__main__":
    main()
