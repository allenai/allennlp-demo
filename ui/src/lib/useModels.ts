import { Dispatch, useReducer, useEffect } from 'react';

import { Model } from './Model';
import { Prediction } from './Prediction';
import { fetchModelInfo } from './ModelInfo';
import * as models from './store/models';

// This types just make the code below that uses them a little more readable. They capture
// distinct states of the Store, allowing us to use a user-defined type guard so that the
// compiler understands it's safe to access the properities specific to each state1
type Loading = models.Store & { store: { current: models.state.Loading } };
type Loaded<I, O> = models.Store & { store: { current: models.state.Loaded<I, O> } };
type FailedToLoad = models.Store & { store: { current: models.state.FailedToLoad } };
type IsPredicting<I, O> = models.Store & { store: { current: models.state.Predicting<I, O> } };
type HasPrediction<I, O> = models.Store & { store: { current: models.state.HasPrediction<I, O> } };
type FailedToPredict<I, O> = models.Store & {
    store: { current: models.state.FailedToPredict<I, O> };
};

// This class wraps the store and dispatcher, which are separate concepts due to the nature
// of React's useReducer, in a single API that's returned via `useModels`. The primary purpose
// is to hide the complexity of the dispatch mechanism from the end user, by providing a series
// of APIs that are easier to digest.
class ModelStoreAdapter<I, O> {
    constructor(readonly store: models.Store, readonly dispatch: Dispatch<models.action.Action>) {}

    loadModels(modelIds: string[]) {
        return Promise.all(modelIds.map(fetchModelInfo)).then((info) => {
            this.dispatch(
                new models.action.Loaded(
                    modelIds,
                    info.map((i) => new Model(i))
                )
            );
        });
    }

    get models(): Model<I, O>[] {
        if (!this.hasLoadedModels()) {
            return [];
        }
        return this.store.current.models;
    }

    selectModelById(id: string) {
        this.dispatch(new models.action.Select(id));
    }

    get selectedModel(): Model<I, O> | undefined {
        if (!this.hasLoadedModels()) {
            return;
        }
        return this.store.current.selected;
    }

    fetchPredictionsUsingSelectedModel(i: I) {
        if (!(this.store.current instanceof models.state.Loaded)) {
            throw new models.error.InvalidState(this.store.current);
        }
        this.dispatch(new models.action.Predicting(i));
        this.store.current.selected
            .predict(i)
            .then((p) => {
                this.dispatch(new models.action.ReceivedPrediction(p));
            })
            .catch((e) => {
                const err = e instanceof Error ? e : new Error(e);
                this.dispatch(new models.action.PredictError(i, err));
            });
    }

    isLoadingModels(): this is Loading {
        return this.store.current instanceof models.state.Loading;
    }

    hasLoadedModels(): this is Loaded<I, O> {
        return this.store.current instanceof models.state.Loaded;
    }

    failedToLoadModels(): this is FailedToLoad {
        return this.store.current instanceof models.state.FailedToLoad;
    }

    isPredicting(): this is IsPredicting<I, O> {
        return this.store.current instanceof models.state.Predicting;
    }

    hasPrediction(): this is HasPrediction<I, O> {
        return this.store.current instanceof models.state.HasPrediction;
    }

    get currentPrediction(): Prediction<I, O> | undefined {
        if (!this.hasPrediction()) {
            return;
        }
        return this.store.current.prediction;
    }

    failedToPredict(): this is FailedToPredict<I, O> {
        return this.store.current instanceof models.state.FailedToPredict;
    }

    hasError(): this is FailedToPredict<I, O> | FailedToLoad {
        return this.failedToLoadModels() || this.failedToPredict();
    }
}

/**
 * This hook takes a list of model ids and attempts to make them available to the UI
 * for the purpose of using in a demo.
 *
 * Calling this method kicks off a few requests that query information about each model, which
 * is displayed in the UI. It's important that consumers of this API handle the case where
 * one or all of these requests fail.
 */
export function useModels<I, O>(...modelIds: string[]): ModelStoreAdapter<I, O> {
    const [store, dispatch] = useReducer(
        models.Store.reducer,
        new models.Store(new models.state.Loading(modelIds))
    );

    const adapter = new ModelStoreAdapter<I, O>(store, dispatch);

    useEffect(() => {
        adapter.loadModels(modelIds);
    }, modelIds);

    return adapter;
}
