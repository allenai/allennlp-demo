import { Model } from '../../Model';
import * as action from './action';
import * as state from './state';
import * as error from './error';

/**
 * A finite state machine that captures information about the current set of models and
 * any relevant output that's used for demonstration purposes.
 */
export class Store {
    constructor(readonly current: state.State) {}

    /**
     * The reducer is responsible for executing state changes in response to dispatched actions.
     * The function is called with the current store and the received action, and returns the
     * resulting state.
     *
     * In some cases the state transition throws when responding to an action. This is meant to
     * only occur in scenarios that shouldn't occur while things are working normally.
     *
     * In other cases we simply return the current state. This occurs when we're handling an action
     * whose effect should be disregarded. This is usually something that handles with asynchronous
     * behavior -- as the UI may have transitioned to a state where the action is no longer
     * relevant. For instance, if a user starts a prediction request but then navigations to a new
     * model, the results will still be dispatched here when the response is returned. Instead
     * of trying to display them, we simply discard them by returning the current state, given the
     * desired state change shouldn't occur.
     */
    static reducer<I, O>(st: Store, a: action.Action): Store {
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
            const m = st.current.models.find((m: Model<I, O>) => m.info.id === a.modelId);
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
