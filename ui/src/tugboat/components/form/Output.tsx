import React from 'react';

interface Props<O, I> {
    children: (io: { input: I; output: O }) => React.ReactNode | JSX.Element;
    output?: O;
    input?: I;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * The component expects one child that's a function. The function is provided the output,
 * and the associated input.
 *
 * @example:
 *  <Output>{ (predictions, input) => (
 *      <PredictedAnswer answer={predictions.best_span} />
 *      <LossGraph loss={predictions.loss} />
 *  )}</Output>
 */
export const Output = <O, I>({ children, output, input }: Props<O, I>) => (
    <>{output && input ? children({ input, output }) : null}</>
);
