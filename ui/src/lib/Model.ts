import React from 'react';
import { ModelInfo, fetchModelInfo } from './ModelInfo';

const HTTP_HEADERS = { Accept: 'application/json', 'Content-Type': 'application/json' };

interface Prediction<I, O> {
    input: I;
    output: O;
}

export class Model<I, O> {
    constructor(readonly info: ModelInfo) {}

    predict(input: I): Promise<Prediction<I, O>> {
        return fetch(`/api/${this.info.id}/predict`, {
            method: 'POST',
            headers: HTTP_HEADERS,
            body: JSON.stringify(input),
        })
            .then((r) => r.json())
            .then((output: O) => ({ input, output }));
    }
}

class ModelNotFoundError extends Error {
    constructor(modelId: string) {
        super(`No model with id ${modelId} found.`);
    }
}

export class ModelList<I, O> {
    public readonly hasModels: boolean;
    constructor(
        readonly all: Model<I, O>[] = [],
        readonly selected: Model<I, O> | undefined = undefined
    ) {
        this.hasModels = all.length > 0;
    }

    withSelectedModel(id: string): ModelList<I, O> {
        const m = this.all.find((m) => m.info.id === id);
        if (!m) {
            throw new ModelNotFoundError(id);
        }
        return new ModelList(this.all, m);
    }
}

class NoModelsError extends Error {
    constructor() {
        super('There are no models to select from.');
    }
}

export function useModels<I, O>(...ids: string[]): [ModelList<I, O>, (mid: string) => void] {
    const [models, setModels] = React.useState<ModelList<I, O>>(new ModelList());
    React.useEffect(() => {
        Promise.all(ids.map(fetchModelInfo)).then((info) => {
            const models: Model<I, O>[] = info.map((inf) => new Model(inf));
            setModels(new ModelList(models, models.length > 0 ? models[0] : undefined));
        });
    }, ids);
    const selectModel = (id: string) => {
        if (!models) {
            throw new NoModelsError();
        }
        setModels(models.withSelectedModel(id));
    };
    return [models, selectModel];
}
