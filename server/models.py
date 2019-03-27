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
    """
    def __init__(self, archive_file: str, predictor_name: str, max_request_length: int) -> None:
        self.archive_file = archive_file
        self.predictor_name = predictor_name
        self.max_request_length = max_request_length

    def predictor(self) -> Predictor:
        archive = load_archive(self.archive_file)
        return Predictor.from_archive(archive, self.predictor_name)

# The initial max_request_length values were selected by querying the DB for:
#
# with queries_with_len as (select *, char_length(request_data) as request_len from queries)
#     select model_name, max(request_len)/2 as max_lim from queries_with_len
#     where response_data is not null
#     group by model_name;
#
# These limits affect less than 1% of queries for each model.

# pylint: disable=line-too-long
MODELS = {
        'machine-comprehension': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/bidaf-model-2017.09.15-charpad.tar.gz',
                'machine-comprehension',
                311108
        ),
        'naqanet-reading-comprehension': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/naqanet-2019.03.01.tar.gz',
                'machine-comprehension',
                25819
        ),
        'semantic-role-labeling': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/srl-model-2018.05.25.tar.gz',
                'semantic-role-labeling',
                4590
        ),
        'open-information-extraction': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/openie-model.2018-08-20.tar.gz',
                'open-information-extraction',
                19681
        ),
        'textual-entailment': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/decomposable-attention-elmo-2018.02.19.tar.gz',
                'textual-entailment',
                13129
        ),
        'coreference-resolution': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz',
                'coreference-resolution',
                21097
        ),
        'named-entity-recognition': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/ner-model-2018.12.18.tar.gz',
                'sentence-tagger',
                94864
        ),
        'fine-grained-named-entity-recognition': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/fine-grained-ner-model-elmo-2018.12.21.tar.gz',
                'sentence-tagger',
                22878
        ),
        'constituency-parsing': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz',
                'constituency-parser',
                2236
        ),
        'dependency-parsing': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/biaffine-dependency-parser-ptb-2018.08.23.tar.gz',
                'biaffine-dependency-parser',
                5675
        ),
        'wikitables-parser': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/wikitables-model-2018.09.14.tar.gz',
                'wikitables-parser',
                8177
        ),
        'nlvr-parser': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/nlvr-erm-model-2018-12-18-rule-vocabulary-updated.tar.gz',
                'nlvr-parser',
                1136
        ),
        'event2mind': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/event2mind-2018.10.26.tar.gz',
                'event2mind',
                11643
        ),
        'atis-parser': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/atis-parser-2018.11.10.tar.gz',
                'atis-parser',
                2236
        ),
        'quarel-parser-zero': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/quarel-parser-zero-2018.12.20.tar.gz',
                'quarel-parser',
                6695
        )
}
# pylint: enable=line-too-long
