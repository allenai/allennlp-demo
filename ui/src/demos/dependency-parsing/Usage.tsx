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
    const ex = examples[0]; // Uriah example

    const installCommand = 'pip install allennlp==1.0.0 allennlp-models==1.0.0';

    const bashCommand = `
echo '{"sentence": "${ex.sentence}."}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    sentence="${ex.sentence}."
)`.trim();

    const evaluationNote = (
        <span>
            The dependency parser was evaluated on the Penn Tree Bank dataset. Unfortunately we
            cannot release this data due to licensing restrictions by the LDC. You can download the
            PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
        </span>
    );

    const trainingNote = (
        <span>
            The dependency parser was evaluated on the Penn Tree Bank dataset. Unfortunately we
            cannot release this data due to licensing restrictions by the LDC. You can download the
            PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
        </span>
    );

    // TODO: The AllenNLP version could be pulled from the model's info route.
    return (
        <ModelUsage
            installCommand={installCommand}
            bashCommand={bashCommand}
            pythonCommand={pythonCommand}
            evaluationNote={evaluationNote}
            trainingNote={trainingNote}
        />
    );
};
