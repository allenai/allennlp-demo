import React from 'react';

import { Model } from '../../lib/Model';

interface Result<I, O> {
    model: Model;
    input: I;
    output: O;
}

interface Props<I, O> {
    children: (result: Result<I, O>) => React.ReactNode | JSX.Element;
    model?: Model;
    output?: O;
    input?: I;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * The component expects one child that's a function. The function is called with a single
 * argument which has the selected `model`, the form `input` and the resulting `output`.
 *
 * @example:
 *  <Output>{ ({ model, input, output }) => (
 *      <PredictedAnswer answer={output.best_span} />
 *      <LossGraph loss={output.loss} />
 *  )}</Output>
 */
export const Output = <I, O>({ children, model, input, output }: Props<I, O>) => (
    <>{model && input && output ? children({ model, input, output }) : null}</>
);
