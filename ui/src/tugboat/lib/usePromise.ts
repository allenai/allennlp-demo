import { useState, useEffect, DependencyList } from 'react';

export enum PromiseState {
    Loading,
    Success,
    Failure,
}

/**
 * Takes a function that, when invoked, returns a Promise and returns a value capturing it's
 * state, the result once it's manifested or an error upon failure.
 *
 * The function is invoked as a side-effect, and will be called whenever the provided dependencies
 * change. This mechanism is identical to that of React's `useEffect` hook, see:
 * https://reactjs.org/docs/hooks-effect.html
 *
 * If the function returns false, all state transitions will be stopped.
 */
export function usePromise<T>(
    promise: () => Promise<T> | false,
    deps: DependencyList
): [PromiseState, T | undefined, Error | undefined] {
    const [state, setState] = useState(PromiseState.Loading);
    const [payload, setPayload] = useState<T>();
    const [cause, setCause] = useState<Error>();
    useEffect(() => {
        const doWork = promise();
        if (!doWork) {
            return;
        }
        setState(PromiseState.Loading);
        doWork
            .then((payload) => {
                setPayload(payload);
                setState(PromiseState.Success);
            })
            .catch((err) => {
                setCause(!(err instanceof Error) ? new Error(err) : err);
                setState(PromiseState.Failure);
            });
    }, deps);
    return [state, payload, cause];
}
