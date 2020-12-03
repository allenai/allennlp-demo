import * as action from './action';
import * as state from './state';
import * as error from './error';

export class Store<I, O> {
    constructor(readonly current: state.State) {}

    isLoading(): this is { current: state.Loading } {
        return this.current instanceof state.Loading;
    }

    hasModels(): this is { current: state.Loaded<I, O> } {
        return this.current instanceof state.Loaded;
    }

    isPredicting(): this is { current: state.Predicting<I, O> } {
        return this.current instanceof state.Predicting;
    }

    hasPrediction(): this is { current: state.HasPrediction<I, O> } {
        return this.current instanceof state.HasPrediction;
    }

    static reducer<I, O>(st: Store<I, O>, a: action.Action): Store<I, O> {
        if (a instanceof action.Loading) {
            return new Store(new state.Loading(a.modelIds));
        }

        if (a instanceof action.Loaded) {
            if (!(st.current instanceof state.Loading)) {
                return st;
            }
            if (st.current.modelIds !== a.modelIds) {
                return st;
            }
            if (a.models.length === 0) {
                throw new error.NoModels();
            }
            return new Store(new state.Loaded(a.models, a.models[0]));
        }

        if (a instanceof action.LoadError) {
            if (!(st.current instanceof state.Loading)) {
                return st;
            }
            if (st.current.modelIds === a.modelIds) {
                return st;
            }
            return new Store(new state.FailedToLoad(a.modelIds, a.cause));
        }

        if (a instanceof action.Select) {
            if (!(st.current instanceof state.Loaded)) {
                throw new error.InvalidState(st.current);
            }
            if (st.current.models.length === 0) {
                throw new error.NoModels();
            }
            const m = st.current.models.find((m) => m.info.id === a.modelId);
            if (!m) {
                throw new error.ModelNotFound(a.modelId);
            }
            return new Store(new state.Loaded(st.current.models, m));
        }

        if (a instanceof action.Predicting) {
            if (!(st.current instanceof state.Loaded)) {
                throw new error.InvalidState(st.current);
            }
            return new Store(new state.Predicting(st.current.models, st.current.selected, a.input));
        }

        if (a instanceof action.ReceivedPrediction) {
            if (!(st.current instanceof state.Predicting)) {
                return st;
            }
            if (st.current.input !== a.prediction.input) {
                return st;
            }
            return new Store(
                new state.HasPrediction(st.current.models, st.current.selected, a.prediction)
            );
        }

        if (a instanceof action.PredictError) {
            if (!(st.current instanceof state.Predicting)) {
                return st;
            }
            if (st.current.input !== a.input) {
                return st;
            }
            return new Store(
                new state.FailedToPredict(st.current.models, st.current.selected, a.input, a.cause)
            );
        }

        throw new error.UnknownAction(a);
    }
}
