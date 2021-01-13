import React from 'react';
import styled from 'styled-components';

import { usePromise } from '../lib';
import { Loading } from './shared';
import { ErrorMessage } from './ErrorMessage';
import { UnknownStateError } from '../error';

export interface Success<I, O> {
    input: I;
    output: O;
}
export type SuccessRenderer<I, O> = (io: Success<I, O>) => React.ReactNode | JSX.Element;

interface Props<I, O> {
    input?: I;
    fetch: (i?: I) => Promise<O>;
    children: SuccessRenderer<I, O>;
    errorMessage?: string;
}

/**
 * A generic component that's responsible for rendering UI states associated with a resource
 * that's obtained asynchronously. While the resource is being fetched a `<Loading />` indicator
 * is rendered, and when things fail an `<ErrorMessage />` is rendered.
 *
 * The component expects a single child that's a function. The function will be passed the
 * `Success` state, which has two properties, `input` and `output`.
 *
 * @example
 *  <Promised input={"modelId"} fn={fetchModelInfo}>{
 *      (output, input) => <FancyOutputDisplay output={output} />
 *  }</Promised>
 */
export const Promised = <I, O>({ input, fetch, children, errorMessage }: Props<I, O>) => {
    const state = usePromise(fetch, input);

    if (state.isLoading() || state.isUnitialized()) {
        return <LoadingWithSpace />;
    }

    if (state.isFailure()) {
        return <ErrorMessage message={errorMessage} />;
    }

    if (state.isSuccess()) {
        return <>{children(state)}</>;
    }

    // We shouldn't ever get here.
    throw new UnknownStateError(state);
};

const LoadingWithSpace = styled(Loading)`
    margin-top: ${({ theme }) => theme.spacing.md};
`;
