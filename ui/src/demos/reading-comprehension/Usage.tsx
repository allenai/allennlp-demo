/**
 * This file defines the text used when explaining to the user how to use this model.
 * It is specific to the task and changes slightly based on the model.
 */

import React from 'react';

import { ModelUsage } from '../../components';
import { Models, Examples } from '../../tugboat/context';
import { NoSelectedModelError, InvalidExamplesFormatError } from '../../tugboat/error';
import { isGroupedExamples } from '../../tugboat/lib';

export const Usage = () => {
    const models = React.useContext(Models);
    const examples = React.useContext(Examples);
    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }
    const x = examples.examples;
    // Reading comp uses GroupedExamples
    if (isGroupedExamples(x)) {
        const ex = x['SQuAD-like Argument Finding'][2]; // matrix example
        // TODO: we need to get these paths from model card
        const evalDataPath =
            'https://s3-us-west-2.amazonaws.com/allennlp/datasets/squad/squad-dev-v1.1.json';
        const trainingDataPath =
            'https://raw.githubusercontent.com/allenai/allennlp-models/v1.0.0/training_config/rc/bidaf_elmo.jsonnet';
        return (
            <ModelUsage
                installCommand={'pip install allennlp==1.0.0 allennlp-models==1.0.0'}
                bashCommand={`echo '{"passage": "${ex.passage.slice(0, 182)}.", "question": "${
                    ex.question
                }"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -`}
                pythonCommand={`from allennlp.predictors.predictor import Predictor
    import allennlp_models.rc
    predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
    predictor.predict(
        passage="${ex.passage.slice(0, 182)}.",
        question="${ex.question}"
    )`}
                evaluationCommand={`allennlp evaluate \\
    ${models.selectedModel.card.archive_file} \\
    ${evalDataPath}`}
                trainingCommand={`allennlp train ${trainingDataPath} \\
    -s output_path`}
            />
        );
    } else {
        throw new InvalidExamplesFormatError(
            `The examples aren't grouped, but we expect them to be`
        );
    }
};
