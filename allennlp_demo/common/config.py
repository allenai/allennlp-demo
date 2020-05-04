import json

from dataclasses import dataclass
from typing import Mapping, Optional

@dataclass(frozen=True)
class Model:
    """
    Class capturing the options we support per model.
    """
    id: str
    archive_file: str
    predictor_name: str
    overrides: Optional[Mapping] = None

    @staticmethod
    def from_file(path: str) -> 'Model':
        with open(path, 'r') as fh:
            return Model(**json.load(fh))

