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
    A demo model is determined by both an archive file
    (representing the trained model)
    and a choice of predictor
    """
    def __init__(self, archive_file: str, predictor_name: str) -> None:
        self.archive_file = archive_file
        self.predictor_name = predictor_name

    def predictor(self) -> Predictor:
        archive = load_archive(self.archive_file)
        return Predictor.from_archive(archive, self.predictor_name)

MODELS = {
        'machine-comprehension': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/bidaf-model-2017.09.15-charpad.tar.gz',  # pylint: disable=line-too-long
                'machine-comprehension'
        ),
        'semantic-role-labeling': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/srl-model-2018.05.25.tar.gz', # pylint: disable=line-too-long
                'semantic-role-labeling'
        ),
        'open-information-extraction': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/openie-model.2018-08-20.tar.gz', # pylint: disable=line-too-long
                'open-information-extraction'
        ),
        'textual-entailment': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/decomposable-attention-elmo-2018.02.19.tar.gz',  # pylint: disable=line-too-long
                'textual-entailment'
        ),
        'coreference-resolution': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz',  # pylint: disable=line-too-long
                'coreference-resolution'
        ),
        'named-entity-recognition': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/ner-model-2018.04.30.tar.gz',  # pylint: disable=line-too-long
                'sentence-tagger'
        ),
        'fine-grained-named-entity-recognition': DemoModel(
            'https://s3-us-west-2.amazonaws.com/allennlp/models/fine-grained-ner-model-elmo-2018.08.31.tar.gz',  # pylint: disable=line-too-long
                'sentence-tagger'
        ),
        'constituency-parsing': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz',  # pylint: disable=line-too-long
                'constituency-parser'
        ),
        'dependency-parsing': DemoModel(
            'https://s3-us-west-2.amazonaws.com/allennlp/models/biaffine-dependency-parser-ptb-2018.08.23.tar.gz',  # pylint: disable=line-too-long
                'biaffine-dependency-parser'
        ),
        'wikitables-parser': DemoModel(
            'https://s3-us-west-2.amazonaws.com/allennlp/models/wikitables-model-2018.09.14.tar.gz',  # pylint: disable=line-too-long
                'wikitables-parser'
        ),
        'event2mind': DemoModel(
            'https://s3-us-west-2.amazonaws.com/allennlp/models/event2mind-2018.09.17.tar.gz',  # pylint: disable=line-too-long
                'event2mind'
        ),
        'atis-parser': DemoModel(
            'https://s3-us-west-2.amazonaws.com/allennlp/models/atis-parser-test-2018.10.04.tar.gz',  # pylint: disable=line-too-long
                 'atis-parser'
        ),
}
