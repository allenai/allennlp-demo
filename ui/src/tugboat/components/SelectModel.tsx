import React from 'react';
import styled from 'styled-components';
import { Form } from 'antd';

import { Field, Select } from './form';
import { Markdown } from './Markdown';
import { Models } from '../context';

/**
 * A component that's used in to select a single model for demonstration purposes. If your
 * demo only has a single modle, you don't need this component.
 */
export const SelectModel = () => {
    const ctx = React.useContext(Models);
    return (
        <Form layout="vertical">
            <Field label="Model">
                <Frame>
                    <Select
                        value={ctx.selectedModel?.id}
                        onChange={(id) => ctx.selectModelById(`${id}`)}>
                        {ctx.models.map((m) => (
                            <Select.Option key={m.id} value={m.id} label={m.card.display_name}>
                                <b>{m.card.display_name}</b>
                                <Markdown>
                                    {m.card.short_description || m.card.description}
                                </Markdown>
                            </Select.Option>
                        ))}
                    </Select>
                    {ctx.selectedModel ? (
                        <Description>
                            <Markdown>{ctx.selectedModel.card.description}</Markdown>
                        </Description>
                    ) : null}
                </Frame>
            </Field>
        </Form>
    );
};

const Frame = styled.div`
    border: 1px solid ${({ theme }) => theme.color.N4};
    background: ${({ theme }) => theme.color.N2};
    border-radius: ${({ theme }) => theme.shape.borderRadius.default};
`;

const Description = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    max-height: 300px;
    overflow-y: auto;
`;
