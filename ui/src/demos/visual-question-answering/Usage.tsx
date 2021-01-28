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
    const ex = examples[0]; // Baseball example

    const installCommand =
        'pip install git+git://github.com/allenai/allennlp.git@0b20f80c1ea700766fe53d2eaf1c28de764f9710 && pip install git+https://github.com/facebookresearch/detectron2@v0.2.1';

    const bashCommand = `
echo '{"question": "${ex.question}", "image": "https://storage.googleapis.com/allennlp-public-data/vqav2/baseball.jpg"}' | \\
    allennlp predict ${models.selectedModel.card.archive_file} -
`.trim();

    const pythonCommand = `
from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging

predictor = Predictor.from_path("${models.selectedModel.card.archive_file}")
predictor.predict(
    question="${ex.question}",
    image="https://storage.googleapis.com/allennlp-public-data/vqav2/baseball.jpg"
)`.trim();

    const evaluationNote = (
        <span>
            Evaluation requires a large amount of images to be accessible locally, so we can't
            provide a command you can easily copy and paste.
        </span>
    );

    // TODO: Get this from the model card.
    const trainingDataPath = 'training_configs/vilbert_vqa_from_huggingface.jsonnet';
    const trainingCommand = `allennlp train \\
    ${trainingDataPath} \\
    -s /path/to/output`.trim();

    // TODO: The AllenNLP version could be pulled from the model's info route.
    return (
        <ModelUsage
            installCommand={installCommand}
            bashCommand={bashCommand}
            pythonCommand={pythonCommand}
            evaluationNote={evaluationNote}
            trainingCommand={trainingCommand}
        />
    );
};
