import React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { Promised } from '@allenai/tugboat/components';
import { Models } from '@allenai/tugboat/context';
import { NoSelectedModelError } from '@allenai/tugboat/error';

import { AttackType } from '../lib';

interface AttackRequest<I> {
    input_field_to_attack: keyof I & string;
    grad_input_field: string;
    inputs: I;
}

interface Props<I, O> {
    input: I;
    type: AttackType;
    target: keyof I & string;
    gradient: string;
    children: (o: O) => React.ReactNode | JSX.Element;
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
    const fetchAttackOutput = () =>
        fetch(`/api/${model.id}/attack/${type}`, {
            method: 'POST',
            body: JSON.stringify(attackInput),
        }).then((r) => r.json());

    return (
        <>
            {description}
            <SpacedButton type="primary" onClick={() => setSubmitted(true)}>
                {label}
            </SpacedButton>
            {submitted ? (
                <Promised promise={fetchAttackOutput} deps={[model, attackInput]}>
                    {children}
                </Promised>
            ) : null}
        </>
    );
};

const SpacedButton = styled(Button)`
    margin-right: ${({ theme }) => theme.spacing.md};
`;
