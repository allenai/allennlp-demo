import React from 'react';

import { Models, CurrentTask, Examples } from '../context';
import { Example, Model, Task } from '../lib';
import { ModelNotFoundError, NoModelsError } from '../error';

interface Props {
    models: Model[];
    task: Task;
    children: React.ReactNode;
}

export const MultiModelDemo = ({ models, task, children }: Props) => {
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

    const [selectedExample, selectExample] = React.useState<Example | undefined>();

    return (
        <CurrentTask.Provider value={{ task }}>
            <Models.Provider value={{ models, selectedModel, selectModelById }}>
                <Examples.Provider
                    value={{ examples: task.examples, selectedExample, selectExample }}>
                    {children}
                </Examples.Provider>
            </Models.Provider>
        </CurrentTask.Provider>
    );
};
