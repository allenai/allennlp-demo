import { Dispatch } from 'react';

import { Model } from '../../Model';
import { fetchModelInfo } from '../../ModelInfo';
import { Prediction } from '../../Prediction';
import * as action from './action';
import * as state from './state';
import * as error from './error';

// These types are used in combination with user-defined type guards below, which makes it
// possible for the display code to opt out of being overly-defensive.
type Loading<I, O> = Store<I, O> & { currentState: state.Loading };
type Loaded<I, O> = Store<I, O> & { selectedModel: Model<I, O>; currentState: state.Loaded<I, O> };
type FailedToLoad<I, O> = Store<I, O> & { currentState: state.FailedToLoad };
type Predicting<I, O> = Store<I, O> & Loaded<I, O> & { currentState: state.Predicting<I, O> };
type HasPrediction<I, O> = Store<I, O> &
    Loaded<I, O> & { currentPrediction: Prediction<I, O>; currentState: state.HasPrediction<I, O> };
type FailedToPredict<I, O> = Store<I, O> &
    Loaded<I, O> & { currentState: state.FailedToPredict<I, O> };

export class Store<I, O> {
    constructor(readonly currentState: state.State, readonly dispatch: Dispatch<action.Action>) {}

    loadModels(modelIds: string[]) {
        return Promise.all(modelIds.map(fetchModelInfo)).then((info) => {
            this.dispatch(
                new action.Loaded(
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
        return this.currentState.models;
    }

    selectModelById(id: string) {
        this.dispatch(new action.Select(id));
    }

    get selectedModel(): Model<I, O> | undefined {
        if (!this.hasLoadedModels()) {
            return;
        }
        return this.currentState.selected;
    }

    fetchPredictionsUsingSelectedModel(i: I) {
        if (!this.hasLoadedModels()) {
            throw new error.InvalidState(this.currentState);
        }
        this.dispatch(new action.Predicting(i));
        this.currentState.selected
            .predict(i)
            .then((p) => {
                this.dispatch(new action.ReceivedPrediction(p));
            })
            .catch((e) => {
                const err = e instanceof Error ? e : new Error(e);
                this.dispatch(new action.PredictError(i, err));
            });
    }

    isLoadingModels(): this is Loading<I, O> {
        return this.currentState instanceof state.Loading;
    }

    hasLoadedModels(): this is Loaded<I, O> {
        return this.currentState instanceof state.Loaded;
    }

    failedToLoadModels(): this is FailedToLoad<I, O> {
        return this.currentState instanceof state.FailedToLoad;
    }

    isPredicting(): this is Predicting<I, O> {
        return this.currentState instanceof state.Predicting;
    }

    hasPrediction(): this is HasPrediction<I, O> {
        return this.currentState instanceof state.HasPrediction;
    }

    get currentPrediction(): Prediction<I, O> | undefined {
        if (!this.hasPrediction()) {
            return;
        }
        return this.currentState.prediction;
    }

    failedToPredict(): this is FailedToPredict<I, O> {
        return this.currentState instanceof state.FailedToPredict;
    }

    hasError(): this is FailedToPredict<I, O> | FailedToLoad<I, O> {
        return this.failedToLoadModels() || this.failedToPredict();
    }

    /**
     * This function processes an action and transforms the current state. The method name
     * derived from React nomenclature: https://reactjs.org/docs/hooks-reference.html#usereducer
     *
     * If the action can't be processed because of a situation that's indicative of a programming
     * error, an exception is thrown.
     *
     * In other cases the current state is returned with no change, and the effect of the action
     * is discarded. This usually occurs due to asynchronous behavior -- for instance, when a
     * response is received for a request that is no longer relevant to the UI.
     */
    static reducer<I, O>(cs: state.State, a: action.Action): state.State {
        if (a instanceof action.Loading) {
            return new state.Loading(a.modelIds);
        }

        if (a instanceof action.Loaded) {
            if (!(cs instanceof state.Loading)) {
                return cs;
            }
            if (cs.modelIds !== a.modelIds) {
                return cs;
            }
            if (a.models.length === 0) {
                throw new error.NoModels();
            }
            return new state.Loaded(a.models, a.models[0]);
        }

        if (a instanceof action.LoadError) {
            if (!(cs instanceof state.Loading)) {
                return cs;
            }
            if (cs.modelIds === a.modelIds) {
                return cs;
            }
            return new state.FailedToLoad(a.modelIds, a.cause);
        }

        if (a instanceof action.Select) {
            if (!(cs instanceof state.Loaded)) {
                throw new error.InvalidState(cs);
            }
            if (cs.models.length === 0) {
                throw new error.NoModels();
            }
            const m = cs.models.find((m: Model<I, O>) => m.info.id === a.modelId);
            if (!m) {
                throw new error.ModelNotFound(a.modelId);
            }
            return new state.Loaded(cs.models, m);
        }

        if (a instanceof action.Predicting) {
            if (!(cs instanceof state.Loaded)) {
                throw new error.InvalidState(cs);
            }
            return new state.Predicting(cs.models, cs.selected, a.input);
        }

        if (a instanceof action.ReceivedPrediction) {
            if (!(cs instanceof state.Predicting)) {
                return cs;
            }
            if (cs.input !== a.prediction.input) {
                return cs;
            }
            return new state.HasPrediction(cs.models, cs.selected, a.prediction);
        }

        if (a instanceof action.PredictError) {
            if (!(cs instanceof state.Predicting)) {
                return cs;
            }
            if (cs.input !== a.input) {
                return cs;
            }
            return new state.FailedToPredict(cs.models, cs.selected, a.input, a.cause);
        }

        throw new error.UnknownAction(a);
    }
}
