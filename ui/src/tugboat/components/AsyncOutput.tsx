import React from 'react';

import { useAsync } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';

interface AsyncOutputProps<I, O> {
    input: I;
    fetch: (i: I) => Promise<O>;
    children: (o: O) => React.ReactNode;
    errorMessage?: string;
}

export const AsyncOutput = <I, O>({
    input,
    fetch,
    children,
    errorMessage,
}: AsyncOutputProps<I, O>) => {
    const output = useAsync(input, fetch);

    if (output.isLoading() || output.isUnitialized()) {
        return <Loading />;
    }

    if (output.isFailure() || !output.isSuccess()) {
        return <ErrorMessage message={errorMessage} />;
    }

    return <>{children(output.payload)}</>;
};
