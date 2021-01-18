/**
 * This file defines the text used when explaining to the user how to use this model.
 * It is specific to the task and changes slightly based on the model.
 */

import React from 'react';

import { ModelUsage } from '../../components';
import { Models, Examples } from '../../tugboat/context';
import { NoSelectedModelError, UngroupedExamplesError } from '../../tugboat/error';
import { isGroupedExamples } from '../../tugboat/lib';

export const Usage = () => {
    const models = React.useContext(Models);
    const { examples } = React.useContext(Examples);

    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    if (!isGroupedExamples(examples)) {
        throw new UngroupedExamplesError();
    }

    // TODO: This seems brittle. If the examples change this will fail at runtime.
    const ex = examples['SQuAD-like Argument Finding'][2]; // matrix example

    const installCommand = 'pip install allennlp==1.0.0 allennlp-models==1.0.0';

    const bashCommand = `
echo '{"passage": "${ex.passage.slice(0, 182)}.", "question": "${ex.question}"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor
import allennlp_models.rc

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    passage="${ex.passage.slice(0, 182)}.",
    question="${ex.question}"
)`.trim();

    // TODO: Get this from the model card.
    const evalDataPath =
        'https://s3-us-west-2.amazonaws.com/allennlp/datasets/squad/squad-dev-v1.1.json';
    const evaluationCommand = `
allennlp evaluate \\
    ${models.selectedModel.card.archive_file} \\
    ${evalDataPath}`.trim();

    // TODO: Get this from the model card.
    const trainingDataPath =
        'https://raw.githubusercontent.com/allenai/allennlp-models/v1.0.0/training_config/rc/bidaf_elmo.jsonnet';
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
