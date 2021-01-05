import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Popover } from 'antd';
import { LinkCSS } from '@allenai/varnish/components';
import { belowOrEqualTo } from '@allenai/varnish/theme/breakpoints';

interface Props {
    children: React.ReactNode | JSX.Element;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * Your output might be really simple:
 *
 * @example
 * <Output>
 *     <Output.Section>
 *         <PredictedAnswer answer={output.best_span} />
 *     </Output.Section>
 * </Output>
 *
 * Other times it might be more complex. When this is the case we recommend grouping related
 * things using the `<Output.Sections>`, `<Output.Section>` and `<Output.SubSection>` components:
 *
 * @example:
 * <Output>
 *     <Output.Section title="Predictions">
 *         <PredictedAnswer answer={output.best_span} />
 *     </Output.Section>
 *     <Output.Section title="Analysis">
 *         <Output.SubSection title="Loss">
 *             <LossGraph loss={output.loss} />
 *         </Output.SubSection>
 *         <Output.SubSection title="Weights">
 *             <WeightsGraph weights={output.weights} />
 *         </Output.SubSection>
 *     </Output.Section>
 * </Output>
 */
export const Output = ({ children }: Props) => <Container>{children}</Container>;

const Container = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
`;

const PopoverWidthFix = createGlobalStyle`
  .ant-popover{
    max-width: 70vw;
  }
`;

interface OutputSectionProps {
    title: string;
    helpLabel?: string;
    helpContent?: React.ReactNode | string;
    children: React.ReactNode;
}

Output.Section = ({
    title,
    helpLabel = 'More Info',
    helpContent,
    children,
}: OutputSectionProps) => {
    const row = (
        <TitleRow>
            <OutputSectionTitle>{title}</OutputSectionTitle>
            {helpContent ? <PopoverTarget>{helpLabel}</PopoverTarget> : null}
        </TitleRow>
    );
    return (
        <OutputSection>
            {helpContent ? (
                <>
                    <PopoverWidthFix />
                    <Popover content={helpContent} title={title}>
                        {row}
                    </Popover>
                </>
            ) : (
                row
            )}
            {children}
        </OutputSection>
    );
};

const OutputSection = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
`;

const OutputSectionTitle = styled.h4`
    margin: 0;
`;

const TitleRow = styled.div`
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    @media ${({ theme }) => belowOrEqualTo(theme.breakpoints.md)} {
        grid-template-columns: 1fr;
        gap: 0;
    }
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

const PopoverTarget = styled.span`
    ${LinkCSS.default()}
    font-style: italic;
`;
