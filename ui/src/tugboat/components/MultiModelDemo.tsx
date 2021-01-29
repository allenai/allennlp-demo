import React from 'react';
import { generatePath } from 'react-router';
import { Redirect, Route, Switch, useHistory, useRouteMatch, useParams } from 'react-router-dom';

import { Config, Models, CurrentTask, Examples } from '../context';
import { Example, Model, Task } from '../lib';
import { ModelNotFoundError, NoModelsError } from '../error';

interface SelectedModelRouteProps {
    models: Model[];
    children: React.ReactNode;
}

const SelectedModelRoute = ({ models, children }: SelectedModelRouteProps) => {
    if (models.length === 0) {
        throw new NoModelsError();
    }

    const { modelId } = useParams<{ modelId: string }>();
    const selectedModel = models.find((m) => m.id === modelId);
    if (!selectedModel) {
        throw new ModelNotFoundError(modelId);
    }

    const { path } = useRouteMatch();
    const history = useHistory();
    const selectModelById = (modelId: string) => {
        history.push(generatePath(path, { modelId }));
    };

    return (
        <Models.Provider value={{ models, selectedModel, selectModelById }}>
            {children}
        </Models.Provider>
    );
};

interface Props {
    models: Model[];
    task: Task;
    children: React.ReactNode;
    appId: string;
    examples?: Example[];
}

export const MultiModelDemo = ({ models, task, children, appId, examples }: Props) => {
    if (models.length === 0) {
        throw new NoModelsError();
    }

    const [selectedExample, selectExample] = React.useState<Example | undefined>();

    const { path } = useRouteMatch();
    const modelPath = `${path}/:modelId`;
    const firstModelPath = generatePath(modelPath, { modelId: models[0].id });

    return (
        <Config.Provider value={{ appId }}>
            <CurrentTask.Provider value={{ task }}>
                <Examples.Provider
                    value={{ examples: examples || task.examples, selectedExample, selectExample }}>
                    <Switch>
                        <Route path={modelPath}>
                            <SelectedModelRoute models={models}>{children}</SelectedModelRoute>
                        </Route>
                        <Redirect to={firstModelPath} />
                    </Switch>
                </Examples.Provider>
            </CurrentTask.Provider>
        </Config.Provider>
    );
};
