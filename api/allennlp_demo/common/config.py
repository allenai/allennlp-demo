import json

from dataclasses import dataclass
from typing import Mapping, Optional, List


VALID_ATTACKERS = ("hotflip", "input_reduction")
VALID_INTERPRETERS = ("simple_gradient", "smooth_gradient", "integrated_gradient")


@dataclass(frozen=True)
class Model:
    """
    Class capturing the options we support per model.
    """

    id: str
    """
    A unique name to identify each demo.
    """

    pretrained_model_id: Optional[str] = None
    """
    The ID of a pretrained model to use from `allennlp_models.pretrained`.
    """

    archive_file: Optional[str] = None
    """
    If `pretrained_model_id` is `None`, `archive_file` is required so we can load the predictor
    directly from the given archive.
    """

    predictor_name: Optional[str] = None
    """
    Optional predictor name to override the default predictor associated with the archive.

    This is ignored if `pretrained_model_id` is given.
    """

    overrides: Optional[Mapping] = None
    """
    Optional parameter overrides to pass through when loading the archive.

    This is ignored if `pretrained_model_id` is given.
    """

    attackers: Optional[List[str]] = None
    """
    List of valid attackers to use.
    """

    interpreters: Optional[List[str]] = None
    """
    List of valid interpreters to use.
    """

    @classmethod
    def from_file(cls, path: str) -> "Model":
        with open(path, "r") as fh:
            out = cls(**json.load(fh))
        assert out.pretrained_model_id is not None or out.archive_file is not None
        for attacker in out.attackers or []:
            assert attacker in VALID_ATTACKERS, f"invalid attacker {attacker}"
        for interpreter in out.interpreters or []:
            assert interpreter in VALID_INTERPRETERS, f"invalid interpreter {interpreter}"
        if out.pretrained_model_id is not None:
            assert (
                out.archive_file is None
            ), "'archive_file' option not supported with 'pretrained_model_id'"
            assert (
                out.predictor_name is None
            ), "'predictor_name' option not supported with 'pretrained_model_id'"
            assert (
                out.overrides is None
            ), "'overrides' option not supported with 'pretrained_model_id'"
        return out
