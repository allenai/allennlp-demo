import json
from dataclasses import dataclass
from typing import Dict, Any, Optional, List

from allennlp.predictors import Predictor


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

    archive_file: str
    """
    The path to the model's archive_file.
    """

    pretrained_model_id: Optional[str] = None
    """
    The ID of a pretrained model to use from `allennlp_models.pretrained`.
    """

    predictor_name: Optional[str] = None
    """
    Optional predictor name to override the default predictor associated with the archive.

    This is ignored if `pretrained_model_id` is given.
    """

    overrides: Optional[Dict[str, Any]] = None
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

    use_old_load_method: bool = False
    """
    Some models that run on older versions need to be load differently.
    """

    @classmethod
    def from_file(cls, path: str) -> "Model":
        with open(path, "r") as fh:
            raw = json.load(fh)
            if "pretrained_model_id" in raw:
                from allennlp_models.pretrained import get_pretrained_models

                model_card = get_pretrained_models()[raw["pretrained_model_id"]]
                raw["archive_file"] = model_card.archive_file
                raw["predictor_name"] = model_card.registered_predictor_name
            out = cls(**raw)

        # Do some validation.
        for attacker in out.attackers or []:
            assert attacker in VALID_ATTACKERS, f"invalid attacker {attacker}"
        for interpreter in out.interpreters or []:
            assert interpreter in VALID_INTERPRETERS, f"invalid interpreter {interpreter}"
        if out.use_old_load_method:
            assert out.pretrained_model_id is None

        return out

    def load_predictor(self) -> Predictor:
        if self.pretrained_model_id is not None:
            from allennlp_models.pretrained import load_predictor

            return load_predictor(self.pretrained_model_id, overrides=self.overrides)

        assert self.archive_file is not None

        if self.use_old_load_method:
            from allennlp.models.archival import load_archive

            # Older versions require overrides to be passed as a JSON string.
            o = json.dumps(self.overrides) if self.overrides is not None else None
            archive = load_archive(self.archive_file, overrides=o)
            return Predictor.from_archive(archive, self.predictor_name)

        return Predictor.from_path(
            self.archive_file, predictor_name=self.predictor_name, overrides=self.overrides
        )
