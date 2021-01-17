import React from 'react';
import { Button } from 'antd';

import { Promised } from '../tugboat/components';
import { Models } from '../tugboat/context';
import { NoSelectedModelError } from '../tugboat/error';

import { InterpreterId } from '../lib';

interface Props<I, O> {
    interpreter: InterpreterId;
    input: I;
    description?: React.ReactNode;
    children: (o: O) => React.ReactNode | JSX.Element;
}

export const Interpret = <I extends { [k: string]: any }, O>({
    interpreter,
    input,
    description,
    children,
}: Props<I, O>) => {
    const [submitted, setSubmitted] = React.useState(false);

    const ctx = React.useContext(Models);
    if (!ctx.selectedModel) {
        throw new NoSelectedModelError();
    }
    const model = ctx.selectedModel;
    const fetchInterpretOutput = () =>
        fetch(`/api/${model.id}/interpret/${interpreter}`, {
            method: 'POST',
            body: JSON.stringify(input),
        }).then((r) => r.json());

    return (
        <>
            {description}
            <Button type="primary" onClick={() => setSubmitted(true)}>
                Interpret Prediction
            </Button>
            {submitted ? (
                <Promised promise={fetchInterpretOutput} deps={[model, interpreter, input]}>
                    {children}
                </Promised>
            ) : null}
        </>
    );
};
