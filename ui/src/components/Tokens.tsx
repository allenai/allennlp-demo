// TODO: move to tugboat?

import styled from 'styled-components';

export const ColorizedToken = styled.span<{ backgroundColor?: string }>`
    background-color: ${({ backgroundColor }) => backgroundColor};
    padding: 1px 2px;
    margin: 1px 2px;
    display: inline-block;
    border-radius: ${({ theme }) => theme.shape.borderRadius.default};
`;

// red token used to represent deletion in InputReduction and replacement in HotFlip
export const RedToken = styled(ColorizedToken)`
    background-color: ${({ theme }) => theme.color.R5};
`;

// green token used to represent addition in HotFlip
export const GreenToken = styled(ColorizedToken)`
    background-color: ${({ theme }) => theme.color.G5};
`;

// green token used to represent addition in HotFlip
export const TransparentToken = styled(ColorizedToken)`
    background-color: 'transparent';
`;

// all white (the UI doesn't display it) token used in InputReduction to show removal
export const BlankToken = styled(ColorizedToken)`
    background-color: transparent;
    color: transparent;
`;
