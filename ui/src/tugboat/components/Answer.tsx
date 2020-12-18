import React from 'react';
import styled from 'styled-components';
import { Space } from 'antd';

/**
 * A component that displays an answer section with a label and some kind of children.
 */
interface Props {
    label: string;
    children: React.ReactNode;
}
const Section = (props: Props) => {
    return (
        <AnswerSpace direction="vertical">
            <Label>{props.label}</Label>
            {props.children}
        </AnswerSpace>
    );
};

const AnswerSpace = styled(Space)`
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

/**
 * A component that displays an answer label for an answer component.
 */
const Label = styled.label`
    display: block;
`;

export const Answer = { Section, Label };
