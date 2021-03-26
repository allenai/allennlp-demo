/**
 * This file defines the text used when explaining to the user how to use this model.
 * It is specific to the task and changes slightly based on the model.
 */

import React from 'react';
import { Models, Examples } from '@allenai/tugboat/context';
import { NoSelectedModelError, CategorizedExamplesError } from '@allenai/tugboat/error';
import { areCategorized } from '@allenai/tugboat/lib';

import { ModelUsage } from '../../components';

export const Usage = () => {
    const models = React.useContext(Models);
    const { examples } = React.useContext(Examples);

    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    if (areCategorized(examples)) {
        throw new CategorizedExamplesError();
    }

    // TODO: This seems brittle. If the examples change this will fail at runtime.
    const ex = examples[0]; // Baseball example

    const bashCommand = `
echo '{"question": "${ex.question}", "image": "https://storage.googleapis.com/allennlp-public-data/vqav2/baseball.jpg"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    question="${ex.question}",
    image="https://storage.googleapis.com/allennlp-public-data/vqav2/baseball.jpg"
)`.trim();

    return (
        <ModelUsage
            bashCommand={bashCommand}
            pythonCommand={pythonCommand}
            modelCard={models.selectedModel.card}
        />
    );
};
