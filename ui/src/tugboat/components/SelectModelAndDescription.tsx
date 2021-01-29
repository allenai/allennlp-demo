import React from 'react';
import styled from 'styled-components';
import { Form } from 'antd';

import { FieldItem } from './form';
import { Markdown } from './Markdown';
import { Models } from '../context';
import { SelectModel } from './SelectModel';

/**
 * A component that's used in to select and display a single model for demonstration purposes.
 * If your demo only has a single model, you don't need this component.
 */
export const SelectModelAndDescription = () => {
    const ctx = React.useContext(Models);
    return (
        <Form layout="vertical">
            <FieldItem label="Model">
                <Frame>
                    <SelectModel />
                    {ctx.selectedModel ? (
                        <Description>
                            <Markdown>{ctx.selectedModel.card.description}</Markdown>
                        </Description>
                    ) : null}
                </Frame>
            </FieldItem>
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
    max-height: 215px;
    overflow-y: auto;
`;
