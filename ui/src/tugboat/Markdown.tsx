import React from 'react';
import { Parser, HtmlRenderer } from 'commonmark';
import styled from 'styled-components';

interface Props {
    children: string;
    className?: string;
}

export const Markdown = ({ children, className }: Props) => {
    const reader = new Parser({ smart: true });
    const writer = new HtmlRenderer({ safe: true });
    const parsed = reader.parse(children);
    const html = writer.render(parsed);
    return <MarkdownContainer className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

// TODO: we need to reeval these styles as varnish should do some of this....
// NOTE: Tables and Strikethrough don't work
const MarkdownContainer = styled.div`
    p {
        &:first-child {
            margin-top: 0;
        }
        &:last-child {
            margin-bottom: 0;
        }
    }
    img {
        max-width: 100%;
    }
    img[src*='#thumbnail'] {
        width: ${({ theme }) => theme.spacing.xxxl};
    }
    ul {
        list-style-type: revert;
    }
    li > p {
        margin-bottom: 0;
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin-top: revert;
    }
`;
