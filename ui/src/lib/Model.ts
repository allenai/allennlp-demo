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

export function useModels<I, O>(...ids: string[]): Model<I, O>[] | undefined {
    const [models, setModels] = React.useState<Model<I, O>[]>();
    React.useEffect(() => {
        Promise.all(ids.map(fetchModelInfo)).then((models) => {
            setModels(models.map((inf) => new Model(inf)));
        });
    }, ids);
    return models;
}
