import React from 'react';
import styled from 'styled-components';

import { InvalidAttributesError } from '../error';

interface Highlights {
    start: number;
    end: number;
    color?: string;
}

interface Props {
    text: string;
    highlights: Highlights[]; // expected to be in order
}

/**
 * Displays a passage of text, highlighting the tokens indicated by `highlights`.
 */
export const TextWithHighlight = (props: Props) => {
    let lastEndIndex = 0;
    const ranges = props.highlights
        .sort((a, b) => a.start - b.start)
        .map((r: Highlights, i: number) => {
            if (r.start < lastEndIndex || r.start >= r.end) {
                throw new InvalidAttributesError(
                    'TextWithHighlight takes highlights that need to be non overlapping.'
                );
            }
            const leadin = props.text.slice(lastEndIndex, r.start);
            const highlight = props.text.slice(r.start, r.end);
            lastEndIndex = r.end;
            return (
                <span key={i}>
                    {leadin}
                    <Highlight color={r.color}>{highlight}</Highlight>
                </span>
            );
        });
    // add any remaining text
    const leadout = props.text.slice(lastEndIndex, props.text.length);
    ranges.push(<span>{leadout}</span>);
    return <>{ranges}</>;
};

const Highlight = styled.span<{ color?: string }>`
    color: ${({ theme, color }) =>
        theme.color[color || 'B6'].useContrastText
            ? theme.palette.text.contrast
            : theme.palette.text.primary};
    background: ${({ theme, color }) => theme.color[color || 'B6']};
    font-weight: 700;
    padding: 0.1875rem;
    margin: 0 0.125rem;
`;
