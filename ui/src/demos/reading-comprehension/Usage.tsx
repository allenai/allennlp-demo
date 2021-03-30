/**
 * This file defines the text used when explaining to the user how to use this model.
 * It is specific to the task and changes slightly based on the model.
 */

import React from 'react';
import { Models, Examples } from '@allenai/tugboat/context';
import { NoSelectedModelError, UncategorizedExamplesError } from '@allenai/tugboat/error';
import { areCategorized } from '@allenai/tugboat/lib';

import { ModelUsage } from '../../components';

export const Usage = () => {
    const models = React.useContext(Models);
    const { examples } = React.useContext(Examples);

    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    if (!areCategorized(examples)) {
        throw new UncategorizedExamplesError();
    }

    // TODO: This seems brittle. If the examples change this will fail at runtime.
    const ex = examples.find((ec) => ec.category === 'SQuAD-like Argument Finding')?.examples[2];
    if (!ex) {
        throw new Error('No example.');
    }

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
