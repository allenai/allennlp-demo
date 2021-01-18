import React from 'react';
import styled from 'styled-components';
import { LinkCSS } from '@allenai/varnish/components';
import { belowOrEqualTo } from '@allenai/varnish/theme/breakpoints';

import { Share } from '../../components';

interface OutputProps {
    children: React.ReactNode | JSX.Element;
}

/**
 * A component to house the output that's displayed after a user submits a `<Form />`.
 * Your demo's visualizations should be rendered as children of this component.
 *
 * Your output might be really simple:
 *
 * <Output>
 *     <Output.Section>
 *         <PredictedAnswer answer={output.best_span} />
 *     </Output.Section>
 * </Output>
 *
 * Other times it might be more complex. When this is the case we recommend grouping related
 * things using the `<Output.Sections>`, `<Output.Section>` and `<Output.SubSection>` components:
 *
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
export const Output = ({ children }: OutputProps) => <Container>{children}</Container>;

const Container = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
`;

interface OutputSectionProps {
    title?: string;
    extra?: React.ReactNode | string;
    children: React.ReactNode;
}

/**
 * A container for related output. The extra property can be used to provide additional components
 * to be rendered next to the provided title. If the title isn't provided the extra content
 * isn't rendered.
 */
Output.Section = ({ title, extra, children }: OutputSectionProps) => (
    <OutputSection>
        {title ? (
            <TitleRow>
                <OutputSectionTitle>{title}</OutputSectionTitle>
                {extra || <span />}
            </TitleRow>
        ) : null}
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
    padding: 0;
`;

const TitleRow = styled.div`
    margin: 0;
    display: flex;
    align-items: baseline;

    /* Safari and iOS don't support 'gap' for 'display: flex', so we use 'magin' instead. */
    > *:not(:last-child) {
        margin: 0 ${({ theme }) => theme.spacing.md} 0 0;
    }

    @media ${({ theme }) => belowOrEqualTo(theme.breakpoints.md)} {
        display: block;
    }
`;

interface ShareableSectionProps<I> {
    title?: string;
    app: string;
    type?: string;
    doc: I;
    slug: string;
    children: React.ReactNode;
}

Output.ShareableSection = <I,>({
    title,
    children,
    doc,
    type,
    app,
    slug,
}: ShareableSectionProps<I>) => (
    <Output.Section
        title={title}
        extra={
            <AlignRight>
                <Share.Link doc={doc} slug={slug} type={type} app={app} />
            </AlignRight>
        }>
        {children}
    </Output.Section>
);

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

export const HelpContent = styled.div`
    width: 60ch;

    p {
        margin: 0 0 ${({ theme }) => theme.spacing.sm};
    }
`;

export const PopoverTarget = styled.span`
    ${LinkCSS.default()}
    font-style: italic;
`;

const AlignRight = styled.span`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;
