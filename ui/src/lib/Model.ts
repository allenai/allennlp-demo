import { ModelInfo } from './ModelInfo';
import { Prediction } from './Prediction';

const HTTP_HEADERS = { Accept: 'application/json', 'Content-Type': 'application/json' };

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
