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

    return (
        <ModelUsage
            bashCommand={bashCommand}
            pythonCommand={pythonCommand}
            modelCard={models.selectedModel.card}
        />
    );
};
