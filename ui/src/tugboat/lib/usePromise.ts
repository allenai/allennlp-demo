import { useReducer, useEffect } from 'react';

import { UnknownActionError } from '../error';

interface Action {}
class ChangeState<I, O> implements Action {
    constructor(readonly desiredState: State<I, O>) {}
}

abstract class State<I, O> {
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
class Uninitialized<I, O> extends State<I, O> {
    // Each class must have a unique constructor signature for the `instanceof` operator
    // to work, so we add one here with a property that we don't end up using anywhere.
    constructor(readonly on: Date = new Date()) {
        super();
    }
}
class Loading<I, O> extends State<I, O> {
    constructor(readonly input: I) {
        super();
    }
}
class Success<I, O> extends State<I, O> {
    constructor(readonly input: I, readonly output: O) {
        super();
    }
}
class Failure<I, O> extends State<I, O> {
    constructor(readonly input: I, readonly cause: Error) {
        super();
    }
}

/**
 * Responds to actions by changing the state. Sometimes the state isn't changed. This happens
 * when the received action isn't something the UI is waiting on anymore.
 */
function reducer<I, O>(currentState: State<I, O>, action: Action): State<I, O> {
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
 * This hook takes a function that returns a `Promise` and the input that's passed to the function
 * when it's executed. The function will be executed once when this is called and whenever `input`
 * changes.
 *
 * The returned `State` will change in response to the associated `Promise`, usually by
 * transitioning from `Loading` to `Success`, at which point the value that was returned
 * can be accessed.
 *
 * The method handles races and will only return a `Success` for the most recent `input`
 * value that was provided.
 */
export function usePromise<I, O>(fetch: (input?: I) => Promise<O>, input?: I): State<I, O> {
    const [state, dispatch] = useReducer(reducer, new Uninitialized());

    useEffect(() => {
        dispatch(new ChangeState(new Loading(input)));
        fetch(input)
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
    // which returns `state` as `State<unknown, unknown>`.
    return state as State<I, O>;
}
