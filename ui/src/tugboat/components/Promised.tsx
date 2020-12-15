import React from 'react';

import { usePromise } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';

interface Props<I, O> {
    input: I;
    fetch: (i: I) => Promise<O>;
    children: (o: O) => React.ReactNode;
    errorMessage?: string;
}

/**
 * A generic component that's responsible for rendering UI states associated with a resource
 * that's obtained asynchronously. While the resource is being fetched a `<Loading />` indicator
 * is rendered, and when things fail an `<ErrorMessage />` is rendered.
 *
 * The component expects a single child which is a function that takes the output and returns
 * React components visualizing it.
 *
 * @example
 *  <Promised<Input, Output>
 *      input={"modelId"}
 *      fn={fetchModelInfo}
 *  >{ (output) => (
 *      <FancyOutputDisplay output={output} />
 *  )}</Promised>
 */
export const Promised = <I, O>({ input, fetch, children, errorMessage }: Props<I, O>) => {
    const output = usePromise(fetch, input);

    if (output.isLoading() || output.isUnitialized()) {
        return <Loading />;
    }

    if (output.isFailure() || !output.isSuccess()) {
        return <ErrorMessage message={errorMessage} />;
    }

    return <>{children(output.output)}</>;
};
