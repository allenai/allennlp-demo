import React from 'react';
import styled, { css } from 'styled-components';

interface Props {
    children: JSX.Element;
    bottomLabels?: boolean; // TODO: convert back to a string?
    isClicking?: boolean;
    className?: string;
}
export const HighlightContainer = ({ bottomLabels, className, isClicking, children }: Props) => {
    return (
        <Wrapper className={className} bottomLabels={bottomLabels} isClicking={isClicking}>
            {children}
        </Wrapper>
    );
};

// TODO: [jon] convert from flex to grid?
// TODO: [jon] replace .bottom with a component
// TODO: [jon] test all this css

const Wrapper = styled.div<{ bottomLabels?: boolean; isClicking?: boolean }>`
    line-height: 42px;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    white-space: pre;
    cursor: default;

    ${({ bottomLabels, theme }) =>
        bottomLabels &&
        css`
            padding: ${theme.spacing.xs} ${theme.spacing.md};
            align-items: flex-start;
            .bottom {
                margin-top: ${theme.spacing.xs2};
            }
        `}

    ${({ isClicking }) =>
        isClicking &&
        css`
            opacity: 0.66;
            transition-duration: 0s;
            span,
            &:before,
            &:after {
                transition-duration: 0s;
            }
        `}
`;
