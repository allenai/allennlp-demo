/**
 * This file defines the text used when explaining to the user how to use this model.
 * It is specific to the task and changes slightly based on the model.
 */

import React from 'react';

import { ModelUsage } from '../../components';
import { Models, Examples } from '../../tugboat/context';
import { NoSelectedModelError, GroupedExamplesError } from '../../tugboat/error';
import { isGroupedExamples } from '../../tugboat/lib';

export const Usage = () => {
    const models = React.useContext(Models);
    const { examples } = React.useContext(Examples);

    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    if (isGroupedExamples(examples)) {
        throw new GroupedExamplesError();
    }

    // TODO: This seems brittle. If the examples change this will fail at runtime.
    const ex = examples[1]; // Two women example

    const installCommand = 'pip install allennlp==1.0.0 allennlp-models==1.0.0';

    const bashCommand = `
echo '{"premise": "${ex.premise}", "hypothesis": "${ex.hypothesis}"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    premise="${ex.premise}"
    hypothesis="${ex.hypothesis}"
)`.trim();

    // TODO: Get this from the model card.
    const evalDataPath = 'https://allennlp.s3.amazonaws.com/datasets/snli/snli_1.0_test.jsonl';
    const evaluationCommand = `
allennlp evaluate \\
    ${models.selectedModel.card.archive_file} \\
    ${evalDataPath}`.trim();

    // TODO: Get this from the model card.
    const trainingDataPath =
        'https://raw.githubusercontent.com/allenai/allennlp-models/v1.0.0/training_config/pair_classification/snli_roberta.jsonnet';
    const trainingCommand = `allennlp train \\
    ${trainingDataPath} \\
    -s /path/to/output`.trim();

    // TODO: The AllenNLP version could be pulled from the model's info route.
    return (
        <ModelUsage
            installCommand={installCommand}
            bashCommand={bashCommand}
            pythonCommand={pythonCommand}
            evaluationCommand={evaluationCommand}
            trainingCommand={trainingCommand}
        />
    );
};
