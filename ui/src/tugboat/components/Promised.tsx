import React, { DependencyList } from 'react';

import { usePromise, PromiseState } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';

type View<T> = (s: T) => React.ReactNode | JSX.Element;

interface Props<T> {
    promise: () => Promise<T>;
    deps: DependencyList;
    children: View<T>;
}

/**
 * A generic component that's responsible for rendering UI states associated with a resource
 * that's obtained asynchronously. While the resource is being fetched a `<Loading />` indicator
 * is rendered, and when things fail an `<ErrorMessage />` is rendered.
 *
 * The component expects a single child that's a function. The function will be passed the
 * the value returned by the promise upon success. The function will only be called when the
 * promise succeeds.
 *
 * The componet is passed a list of dependencies. When any of these change, the asynchronous
 * task will be started again.
 *
 * Here's an example of how this might be used:
 *
 * <Promised promise={() => fetchModelInfo(modelId)} deps={[ modelId ]}>{
 *    (info) => <ModelInfo info={info} />
 * }</Promised>
 */
export const Promised = <T,>({ promise, deps, children }: Props<T>) => {
    const [state, payload, err] = usePromise(promise, deps);

    if (state === PromiseState.Loading) {
        return <Loading />;
    }

    if (state === PromiseState.Failure || !payload) {
        console.error('Promise failure:', err);
        return <ErrorMessage />;
    }

    return <>{children(payload)}</>;
};
