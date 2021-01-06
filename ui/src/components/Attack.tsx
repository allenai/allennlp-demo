// TODO: move to tugboat?

import React from 'react';
import { Button } from 'antd';

import { Promised } from '../tugboat/components';
import { Models } from '../tugboat/context';
import { NoSelectedModelError } from '../tugboat/error';

import { AttackType, GradientInputField } from '../lib';

class EmptyAttackRequestError extends Error {
    constructor() {
        super('An attack request cannot be empty.');
    }
}

interface AttackRequest<I> {
    input_field_to_attack: keyof I & string;
    grad_input_field: GradientInputField;
    inputs: I;
}

interface Props<I, O> {
    input: I;
    type: AttackType;
    target: keyof I & string;
    gradient: GradientInputField;
    children: (io: { input: AttackRequest<I>; output: O }) => React.ReactNode | JSX.Element;
    label: string;
    description?: React.ReactNode;
}

export const Attack = <I, O>({
    type,
    input,
    children,
    target,
    gradient,
    label,
    description,
}: Props<I, O>) => {
    const [submitted, setSubmitted] = React.useState(false);

    const ctx = React.useContext(Models);
    if (!ctx.selectedModel) {
        throw new NoSelectedModelError();
    }
    const model = ctx.selectedModel;
    const attackInput: AttackRequest<I> = {
        input_field_to_attack: target,
        grad_input_field: gradient,
        inputs: input,
    };
    const fetchAttackOutput = (attack?: AttackRequest<I>) => {
        if (!attack) {
            throw new EmptyAttackRequestError();
        }
        return fetch(`/api/${model.id}/attack/${type}`, {
            method: 'POST',
            body: JSON.stringify(attack),
        }).then((r) => r.json());
    };

    return (
        <>
            {description}
            <Button type="primary" onClick={() => setSubmitted(true)}>
                {label}
            </Button>
            {submitted ? (
                <Promised input={attackInput} fetch={fetchAttackOutput}>
                    {children}
                </Promised>
            ) : null}
        </>
    );
};
