import React from 'react';

import { useAsync } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';

interface AsyncOutputProps<I, O> {
    input: I;
    fn: (i: I) => Promise<O>;
    children: (o: O) => React.ReactNode;
    errorMessage?: string;
}

/**
 * A generic component that's responsible for rendering UI states associated with a resource
 * that's obtained asynchronously. While the resource is being fetched a `<Loading />` indicator
 * is rendered, and when things fail an `<ErrorMessage />` is rendered.
 *
 * The children should be expressed a function that takes a single parameter representing the
 * output that's being waited on, e.g.:
 *
 * @example
 *  <AsyncOutput<Input, Output>
 *      input={"modelId"}
 *      fn={fetchModelInfo}>{ (output) => (
 *      <FancyOutputDisplay output={output} />
 *  )}</AsyncOutput>
 */
export const AsyncOutput = <I, O>({
    input,
    fn,
    children,
    errorMessage,
}: AsyncOutputProps<I, O>) => {
    const output = useAsync(fn, input);

    if (output.isLoading() || output.isUnitialized()) {
        return <Loading />;
    }

    if (output.isFailure() || !output.isSuccess()) {
        return <ErrorMessage message={errorMessage} />;
    }

    return <>{children(output.output)}</>;
};
