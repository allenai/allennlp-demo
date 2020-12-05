import React from 'react';
import { Divider } from 'antd';

import { Models } from '../context';
import { NoSelectedModel } from '../error';
import { AsyncOutput } from './AsyncOutput';

import * as form from './form';

class InvalidPredictChildrenError extends Error {
    constructor() {
        super(
            'The <Predict /> element expects exactly 2 children. The first must be a ' +
                '<PredictInput /> and the second must be a <PredictOutput />.'
        );
    }
}

/**
 * The <PredictInput /> and <PredictOutput /> components defined here intentionally do
 * very little. They're used to make the separation of input and output clear where the
 * <Predict /> component is used.
 */
interface PredictInputProps {
    children: React.ReactNode;
}

export const PredictInput = ({ children }: PredictInputProps) => <>{children}</>;

interface PredictOutputProps<O> {
    children: (output: O) => React.ReactNode;
    output?: O;
}

export const PredictOutput = <O,>({ children, output }: PredictOutputProps<O>) => (
    <>{output ? children(output) : null}</>
);

interface Props {
    action: (modelId: string) => string;
    children: React.ReactNode;
}

export const Predict = <I, O>(props: Props) => {
    const [input, setInput] = React.useState<I>();

    const models = React.useContext(Models);
    const fetchPredictions = (i: I) => {
        if (!models.selectedModel) {
            throw new NoSelectedModel();
        }
        const url = props.action(models.selectedModel.id);
        return fetch(url, { method: 'POST', body: JSON.stringify(i) }).then((r) => r.json());
    };

    // We do a little work to try and make sure the children look like they're supposed to.
    // We expect the following:
    //
    //  <Predict>
    //      <PredictInput>
    //          {/* Fields */ }
    //      </PredictInput>
    //      <PredictOutput>{ (output) => (
    //          /* Output Visualizations */
    //      )}</PredictOutput>
    //  </Predict>
    //
    // We don't actually check that they're the correct type (by making sure they're actually
    // instances of <PredictInput /> and <PredictOutput>), because I couldn't find a way to
    // do this.
    const children = React.Children.toArray(props.children);
    if (!children || children.length !== 2) {
        throw new InvalidPredictChildrenError();
    }

    const [firstChild, secondChild] = React.Children.toArray(children);
    if (!React.isValidElement(firstChild)) {
        throw new InvalidPredictChildrenError();
    }
    if (!React.isValidElement(secondChild)) {
        throw new InvalidPredictChildrenError();
    }

    return (
        <>
            <form.Form
                onFinish={(i) => {
                    setInput(i as I);
                }}>
                {firstChild}
            </form.Form>
            <Divider />
            {input ? (
                <AsyncOutput<I, O> input={input} fn={fetchPredictions}>
                    {(output: O) => React.cloneElement(secondChild, { output })}
                </AsyncOutput>
            ) : null}
        </>
    );
};
