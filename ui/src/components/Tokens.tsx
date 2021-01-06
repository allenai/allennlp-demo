import styled from 'styled-components';

export const HighlightedToken = styled.span<{ background?: string }>`
    background-color: ${({ background: backgroundColor }) => backgroundColor};
    padding: 1px 2px;
    margin: 1px 2px;
    display: inline-block;
    border-radius: ${({ theme }) => theme.shape.borderRadius.default};
`;

// red token used to represent deletion in InputReduction and replacement in HotFlip
export const RedToken = styled(HighlightedToken)`
    background-color: ${({ theme }) => theme.color.R5};
`;

// green token used to represent addition in HotFlip
export const GreenToken = styled(HighlightedToken)`
    background-color: ${({ theme }) => theme.color.G5};
`;

// transparent token used to have correct spacing of elements in HotFlip
export const TransparentToken = styled(HighlightedToken)`
    background-color: 'transparent';
`;

// all white (the UI doesn't display it) token used in InputReduction to show removal
export const BlankToken = styled(HighlightedToken)`
    background-color: transparent;
    color: transparent;
`;
