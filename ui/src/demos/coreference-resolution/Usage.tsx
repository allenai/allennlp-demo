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
    const ex = examples[0]; // Paul Allen example

    const installCommand = 'pip install allennlp==1.0.0 allennlp-models==1.0.0';

    const bashCommand = `
echo '{"document": "${ex.document.slice(0, 267)}"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    document="${ex.document.slice(0, 267)}"
)`.trim();

    const evaluationNote = (
        <span>
            The Coreference model was evaluated on the CoNLL 2012 dataset. Unfortunately we cannot
            release this data due to licensing restrictions by the LDC. To compile the data in the
            right format for evaluating the Coreference model, please see
            scripts/compile_coref_data.sh. This script requires the Ontonotes 5.0 dataset, available
            on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
        </span>
    );

    const trainingNote = (
        <span>
            The Coreference model was evaluated on the CoNLL 2012 dataset. Unfortunately we cannot
            release this data due to licensing restrictions by the LDC. To compile the data in the
            right format for evaluating the Coreference model, please see
            scripts/compile_coref_data.sh. This script requires the Ontonotes 5.0 dataset, available
            on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
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
