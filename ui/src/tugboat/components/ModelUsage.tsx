import React from 'react';

import { Models } from '../context';
import { NoSelectedModel } from '../error';

export const ModelUsage = () => {
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModel();
    }

    return (
        <>
            <h4>Installing AllenNLP</h4>
            {models.selectedModel.card.display_name}
            <h4>Prediction</h4>
            <h5>On the command line (bash):</h5>
            <h5>As a library (python):</h5>
            <h4>Evaluation</h4>
            <h4>Training</h4>
            <h4>Installing AllenNLP</h4>
        </>
    );
};
