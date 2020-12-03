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
            .then((output: O) => ({ input, output }))
    }
}

class ModelNotFoundError extends Error {
    constructor(modelId: string) {
        super(`No model with id ${modelId} found.`);
    }
}

class State {};
export class Idle extends State {};
export class Predicting<I> extends State {
    constructor(readonly input: I) {
        super();
    };
}
export class PredictionFailed<I, O> extends State  {
    constructor(readonly model: Model<I, O>, readonly input: I, readonly error: Error) {
        super();
    }
}
export class PredictionSucceeded<I, O> extends State {
    constructor(readonly model: Model<I, O>, readonly input: I, readonly predictions: O) {
        super();
    }
}

class SelectedModel<I, O> {
    constructor(
        readonly model: Model<I, O>,
        readonly state: State = new Idle()
    ) {}

    isPredicting(): this is SelectedModel<I, O> & { state: Predicting<I> } {
        return this.state instanceof Predicting;
    }

    hasPredictions(): this is SelectedModel<I, O> & { state: PredictionSucceeded<I, O> } {
        return this.state instanceof PredictionSucceeded;
    }

    withState(state: State): SelectedModel<I, O> {
        if (state instanceof PredictionSucceeded || state instanceof PredictionFailed) {
            if (!this.isPredicting()) {
                return this;
            }
            if(this.state.input != state.input) {
                return this;
            }
            return new SelectedModel(this.model, state);
        }
        return new SelectedModel(this.model, state);
    }
}

export class ModelList<I, O> {
    public readonly hasModels: boolean;
    constructor(
        readonly all: Model<I, O>[] = [],
        readonly selected: SelectedModel<I, O> | undefined = undefined,
    ) {
        this.hasModels = all.length > 0;
    }

    selectModel(id: string): ModelList<I, O> {
        const model = this.all.find((m) => m.info.id === id);
        if (!model) {
            throw new ModelNotFoundError(id);
        }
        return new ModelList(this.all, new SelectedModel(model));
    }

    updateSelectedModel(state: State) {
        if (!this.selected) {
            throw new NoSelectedModelError();
        }
        return new ModelList(this.all, this.selected.withState(state));
    }

}

class NoModelsError extends Error {
    constructor() {
        super('There are no models to select from.');
    }
}

class NoSelectedModelError extends Error {
    constructor() {
        super('There isn\'t selected model.');
    }
}

class Action {};
class LoadedModels<I, O> extends Action {
    constructor(readonly models: Model<I, O>[]){
        super();
    }
}
class SelectModel extends Action {
    constructor(readonly modelId: string) {
        super();
    }
}
class UpdateModelState extends Action {
    constructor(readonly state: State) {
        super();
    }
}

class UnknownActionError extends Error {
    constructor(action: Action) {
        super(`Unknown action: ${JSON.stringify(action)}`);
    }
}

function handleStateChange<I, O>(list: ModelList<I, O>, action: Action): ModelList<I, O> {
    if (action instanceof LoadedModels) {
        const first = action.models.length > 0 ? new SelectedModel(action.models[0]) : undefined;
        return new ModelList(action.models, first);
    } if (action instanceof SelectModel) {
        return list.selectModel(action.modelId);
    } else if (action instanceof UpdateModelState) {
        return list.updateSelectedModel(action.state);
    } else {
        throw new UnknownActionError(action);
    }
}

export function useModels<I, O>(...ids: string[]): [ModelList<I, O>, (mid: string) => void, (input: I) => void] {
    const [models, dispatch] = React.useReducer(
        handleStateChange,
        new ModelList<I, O>(),
    );
    React.useEffect(() => {
        Promise.all(ids.map(fetchModelInfo)).then((info) => {
            const models: Model<I, O>[] = info.map((inf) => new Model(inf));
            dispatch(new LoadedModels(models));
        });
    }, ids);
    const selectModel = (id: string) => {
        if (!models) {
            throw new NoModelsError();
        }
        dispatch(new SelectModel(id));
    };
    const fetchPredictions = (i: I) => {
        if (!models.selected) {
            throw new NoSelectedModelError();
        }
        const { model } = models.selected;
        dispatch(new UpdateModelState(new Predicting(i)));
        model.predict(i)
            .then((o) => {
                dispatch(new UpdateModelState(new PredictionSucceeded(
                    model,
                    o.input,
                    o.output
                )));
            })
            .catch((e) => {
                const err = e instanceof Error ? e : new Error(e);
                dispatch(new UpdateModelState(new PredictionFailed(
                    model,
                    i,
                    err
                )));
            });
    }
    // TODO: This cast has to do with the fact that the ModelList<I, O> inferred via useReducer<I, O>
    // becomes ModelList<unknown, unknown>. I'd like to remove this if I can unwind things.
    return [models as unknown as ModelList<I, O>, selectModel, fetchPredictions];
}
