import React from 'react';
import styled from 'styled-components';

interface Props {
    json: any;
}

/**
 * Nicely prints the provided input, serialized as JSON.
 *
 * TODO: It'd be great if we added code highlighting.
 */
export const PrettyPrintedJSON = ({ json }: Props) => <Pre>{JSON.stringify(json, null, 2)}</Pre>;

const Pre = styled.pre`
    ${({ theme }) => `
        white-space: break-spaces;
        background: ${theme.color.B9};
        border: 1px solid ${theme.color.B10};
        border-radius: ${theme.shape.borderRadius.default};
        padding: ${theme.spacing.md};
        color: ${theme.color.O3};
    `}
`;
