/* TODO: Change Q to I and T to O for clarity. Also change symbols from query to input
 * and payload to output. */
import { useReducer, useEffect } from 'react';

class UnknownActionError extends Error {
    constructor(action: AsyncAction) {
        super(`Unknown action: ${action.constructor.name}`);
    }
}

interface AsyncAction {}
class ChangeState<Q, T> implements AsyncAction {
    constructor(readonly desiredState: AsyncState<Q, T>) {}
}

abstract class AsyncState<Q, T> {
    isUnitialized(): this is Uninitialized<Q, T> {
        return this instanceof Uninitialized;
    }

    isLoading(): this is Loading<Q, T> {
        return this instanceof Loading;
    }

    isSuccess(): this is Success<Q, T> {
        return this instanceof Success;
    }

    isFailure(): this is Failure<Q, T> {
        return this instanceof Failure;
    }
}
class Uninitialized<Q, T> extends AsyncState<Q, T> {
    readonly isEmpty = true;
}
class Loading<Q, T> extends AsyncState<Q, T> {
    constructor(readonly query: Q) {
        super();
    }
}
class Success<Q, T> extends AsyncState<Q, T> {
    constructor(readonly query: Q, readonly payload: T) {
        super();
    }
}
class Failure<Q, T> extends AsyncState<Q, T> {
    constructor(readonly query: Q, readonly cause: Error) {
        super();
    }
}

function reducer<Q, T>(currentState: AsyncState<Q, T>, action: AsyncAction): AsyncState<Q, T> {
    if (action instanceof ChangeState) {
        if (action.desiredState instanceof Success || action.desiredState instanceof Failure) {
            // We need to make sure the desired state is still relevant. If we're not currently
            // loading something, then we shouldn't transition to the new state.
            if (!(currentState instanceof Loading)) {
                return currentState;
            }

            // ...and if whatever we loaded (or failed to load) isn't what we're currently waiting
            // on, then drop the desired state on the floor.
            if (currentState.query !== action.desiredState.query) {
                return currentState;
            }

            return action.desiredState;
        }

        // If we ended up here we're loading, which is always safe to transition to.
        return action.desiredState;
    }

    throw new UnknownActionError(action);
}

export function useAsync<Q, T>(query: Q, fetch: (q: Q) => Promise<T>): AsyncState<Q, T> {
    const [state, dispatch] = useReducer(reducer, new Uninitialized());

    useEffect(() => {
        dispatch(new ChangeState(new Loading(query)));
        fetch(query)
            .then((p) => dispatch(new ChangeState(new Success(query, p))))
            .catch((e) => {
                const err = e instanceof Error ? e : new Error(e);
                dispatch(new ChangeState(new Failure(query, err)));
            });
    }, [query]);

    // The cast here is necessary because of type erasure that occurs with `useReducer`,
    // which returns `state` as `AsyncState<unknown, unknown>`.
    return state as AsyncState<Q, T>;
}
