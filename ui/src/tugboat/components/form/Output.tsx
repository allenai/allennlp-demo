import React from 'react';
import styled from 'styled-components';

import { Model } from '../../lib/Model';

export interface Result<I, O> {
    model: Model;
    input: I;
    output: O;
}

interface Props<I, O> {
    children: (result: Result<I, O>) => React.ReactNode | JSX.Element;
    model?: Model;
    output?: O;
    input?: I;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * The component expects one child that's a function. The function is called with a single
 * argument which has the selected `model`, the form `input` and the resulting `output`.
 *
 * Your output might be really simple:
 *
 * @example
 *  <Output<MyInput, Predictions>>{ ({ model, input, output }) => (
 *      <PredictedAnswer answer={output.best_span} />
 *  )}</Output>
 *
 * Other times it might be more complex. When this is the case we recommend grouping related
 * things using the `<Output.Sections>`, `<Output.Section>` and `<Output.SubSection>` components:
 *
 * @example:
 *  <Output<MyInput, Predictions>>{ ({ model, input, output }) => (
 *      <Output.Sections>
 *          <Output.Section title="Predictions">
 *              <PredictedAnswer answer={output.best_span} />
 *          </Output.Section>
 *          <Output.Section title="Analysis">
 *              <Output.SubSection title="Loss">
 *                  <LossGraph loss={output.loss} />
 *              </Output.SubSection>
 *              <Output.SubSection title="Weights">
 *                  <WeightsGraph weights={output.weights} />
 *              </Output.SubSection>
 *          </Output.Section>
 *      </Output.Sections>
 *  )}</Output>
 */
export const Output = <I, O>({ children, model, input, output }: Props<I, O>) => (
    <>{model && input && output ? children({ model, input, output }) : null}</>
);

Output.Sections = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
`;

interface OutputSectionProps {
    title: string | JSX.Element;
    children: React.ReactNode;
}

Output.Section = ({ title, children }: OutputSectionProps) => (
    <OutputSection>
        <OutputSectionTitle>{title}</OutputSectionTitle>
        {children}
    </OutputSection>
);

const OutputSection = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
`;

const OutputSectionTitle = styled.h4`
    margin: 0;
`;

Output.SubSection = ({ title, children }: OutputSectionProps) => (
    <OutputSubSection>
        <OutputSubSectionTitle>{title}</OutputSubSectionTitle>
        {children}
    </OutputSubSection>
);

const OutputSubSection = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xs};
`;

const OutputSubSectionTitle = styled.h5`
    margin: 0;
    text-transform: none;
`;
