import React from 'react';
import styled from 'styled-components';

import { Markdown } from './Markdown';
import { Models } from '../context';

/**
 * A component that's used in to display a single model for demonstration purposes.
 */
export const SelectedModelDescription = () => {
    const ctx = React.useContext(Models);
    return (
        <>
            {ctx.selectedModel ? (
                <>
                    <div>Model</div>
                    <Title>{ctx.selectedModel.card.display_name}</Title>
                    <Description>
                        <Markdown>{ctx.selectedModel.card.description}</Markdown>
                    </Description>
                </>
            ) : null}
        </>
    );
};

const Title = styled.div`
    font-weight: ${({ theme }) => theme.typography.font.weight.bold};
    padding: ${({ theme }) => `${theme.spacing.xs} 0`};
`;

const Description = styled.div`
    max-height: 115px;
    overflow-y: auto;
    padding-bottom: ${({ theme }) => theme.spacing.md};
`;
