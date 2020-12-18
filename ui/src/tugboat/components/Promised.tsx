import React from 'react';

import { usePromise } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';
import { UnknownStateError } from '../error';

interface Props<I, O> {
    input?: I;
    fetch: (i?: I) => Promise<O>;
    children: (o: O, i: I) => React.ReactNode | JSX.Element;
    errorMessage?: string;
}

/**
 * A generic component that's responsible for rendering UI states associated with a resource
 * that's obtained asynchronously. While the resource is being fetched a `<Loading />` indicator
 * is rendered, and when things fail an `<ErrorMessage />` is rendered.
 *
 * The component expects a single child that's a function. The function will be passed the
 * returned ouput and the input associated with it. It should return the resulting JSX.
 *
 * @example
 *  <Promised input={"modelId"} fn={fetchModelInfo}>{
 *      (output, input) => <FancyOutputDisplay output={output} />
 *  }</Promised>
 */
export const Promised = <I, O>({ input, fetch, children, errorMessage }: Props<I, O>) => {
    const state = usePromise(fetch, input);

    if (state.isLoading() || state.isUnitialized()) {
        return <Loading />;
    }

    if (state.isFailure()) {
        return <ErrorMessage message={errorMessage} />;
    }

    if (state.isSuccess()) {
        return <>{children(state.output, state.input)}</>;
    }

    // We shouldn't ever get here.
    throw new UnknownStateError(state);
};
