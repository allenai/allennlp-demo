import { useReducer, useEffect } from 'react';

import { UnknownActionError } from '../error';

interface AsyncAction {}
class ChangeState<I, O> implements AsyncAction {
    constructor(readonly desiredState: AsyncState<I, O>) {}
}

abstract class AsyncState<I, O> {
    isUnitialized(): this is Uninitialized<I, O> {
        return this instanceof Uninitialized;
    }

    isLoading(): this is Loading<I, O> {
        return this instanceof Loading;
    }

    isSuccess(): this is Success<I, O> {
        return this instanceof Success;
    }

    isFailure(): this is Failure<I, O> {
        return this instanceof Failure;
    }
}
class Uninitialized<I, O> extends AsyncState<I, O> {
    readonly isEmpty = true;
}
class Loading<I, O> extends AsyncState<I, O> {
    constructor(readonly input: I) {
        super();
    }
}
class Success<I, O> extends AsyncState<I, O> {
    constructor(readonly input: I, readonly output: O) {
        super();
    }
}
class Failure<I, O> extends AsyncState<I, O> {
    constructor(readonly input: I, readonly cause: Error) {
        super();
    }
}

/**
 * Responds to actions by changing the state. Sometimes the state isn't changed. This happens
 * when the received action isn't something the UI is waiting on anymore.
 */
function reducer<I, O>(currentState: AsyncState<I, O>, action: AsyncAction): AsyncState<I, O> {
    if (action instanceof ChangeState) {
        if (action.desiredState instanceof Success || action.desiredState instanceof Failure) {
            // We need to make sure the desired state is still relevant. If we're not currently
            // loading something, then we shouldn't transition to the new state.
            if (!(currentState instanceof Loading)) {
                return currentState;
            }

            // ...and if whatever we loaded (or failed to load) isn't what we're currently waiting
            // on, then drop the desired state on the floor.
            if (currentState.input !== action.desiredState.input) {
                return currentState;
            }

            return action.desiredState;
        }

        // If we ended up here we're loading, which is always safe to transition to.
        return action.desiredState;
    }

    throw new UnknownActionError(action.constructor.name);
}

/**
 * Takes a function that returns an asynchronous promise for output. The function is given the
 * accompanying input, and called whenever that input changes.
 */
export function useAsync<I, O>(fn: (q: I) => Promise<O>, input: I): AsyncState<I, O> {
    const [state, dispatch] = useReducer(reducer, new Uninitialized());

    useEffect(() => {
        dispatch(new ChangeState(new Loading(input)));
        fn(input)
            .then((o) => dispatch(new ChangeState(new Success(input, o))))
            .catch((e) => {
                // The failure is of type `any`, so we convert it to an `Error` if it already isn't
                // one. This makes sure that it has a stack trace, though admittedly when we
                // perform the conversion that stack will point here, which might not be very
                // helpful.
                const err = e instanceof Error ? e : new Error(e);
                dispatch(new ChangeState(new Failure(input, err)));
            });
    }, [input]);

    // The cast here is necessary because of type erasure that occurs with `useReducer`,
    // which returns `state` as `AsyncState<unknown, unknown>`.
    return state as AsyncState<I, O>;
}
