import React from 'react';
import styled from 'styled-components';

/**
 * A component that displays an answer section with a label and some kind of children.
 */
interface Props {
    label: string;
    children: React.ReactNode;
}
const Section = (props: Props) => {
    return (
        <AnswerWrapper>
            <Label>{props.label}</Label>
            {props.children}
        </AnswerWrapper>
    );
};

const AnswerWrapper = styled.div`
    padding-bottom: ${({ theme }) => theme.spacing.md};
`;

/**
 * A component that displays an answer label for an answer component.
 */
const Label = styled.label`
    display: block;
    margin-top: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NoAnswer = () => {
    return (
        <Section label="Answer">
            <div>No answer returned.</div>
        </Section>
    );
};

export const Answer = { Section, Label, NoAnswer };
