import React from 'react';

interface Props<O> {
    children: (output: O) => React.ReactNode;
    output?: O;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * The component expects one child that's a function. The function is provided the output
 * once it's available.
 *
 * @example:
 *  <Output>{ (predictions) => (
 *      <PredictedAnswer answer={predictions.best_span} />
 *      <LossGraph loss={predictions.loss} />
 *  )}</Output>
 */
export const Output = <O,>({ children, output }: Props<O>) => (
    <>{output ? children(output) : null}</>
);
