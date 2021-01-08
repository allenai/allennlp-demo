// NOTE: DON'T REVIEW THIS FILE YET, IT'S IN PROGRESS

import React from 'react';
import styled, { css } from 'styled-components';

interface Props {
    children: JSX.Element;
    bottomLabels?: boolean;
    isClicking?: boolean;
    className?: string;
}
export const HighlightContainer = ({ bottomLabels, className, children }: Props) => {
    return (
        <Wrapper className={className} bottomLabels={bottomLabels} isClicking={isClicking}>
            {children}
        </Wrapper>
    );
};

// TODO: convert from flex to grid?
// TODO: replace .bottom with a component
// TODO: test all this css

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
