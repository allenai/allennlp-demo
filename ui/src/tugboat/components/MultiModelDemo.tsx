import React from 'react';

import { Models } from '../context';
import { Model } from '../lib';
import { ModelNotFoundError, NoModelsError } from '../error';

interface Props {
    models: Model[];
    children: React.ReactNode;
}

export const MultiModelDemo = ({ models, children }: Props) => {
    if (models.length === 0) {
        throw new NoModelsError();
    }
    const [selectedModel, selectModel] = React.useState<Model>(models[0]);
    const selectModelById = (modelId: string) => {
        const model = models.find((m) => m.id === modelId);
        if (!model) {
            throw new ModelNotFoundError(modelId);
        }
        selectModel(model);
    };
    return (
        <Models.Provider value={{ models, selectedModel, selectModelById }}>
            {children}
        </Models.Provider>
    );
};
