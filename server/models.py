from allennlp.service.predictors import DemoModel

# This maps from the name of the task
# to the ``DemoModel`` indicating the location of the trained model
# and the type of the ``Predictor``.  This is necessary, as you might
# have multiple models (for example, a NER tagger and a POS tagger)
# that have the same ``Predictor`` wrapper. The corresponding model
# will be served at the `/predict/<name-of-task>` API endpoint.
MODELS = {
        'machine-comprehension': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/bidaf-model-2017.09.15-charpad.tar.gz',  # pylint: disable=line-too-long
                'machine-comprehension'
        ),
        'semantic-role-labeling': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/srl-model-2018.05.25.tar.gz', # pylint: disable=line-too-long
                'semantic-role-labeling'
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
        'constituency-parsing': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz',  # pylint: disable=line-too-long
                'constituency-parser'
        ),
        'dependency-parsing': DemoModel(
                'https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz',  # pylint: disable=line-too-long
                'biaffine-dependency-parser'
        )
}
