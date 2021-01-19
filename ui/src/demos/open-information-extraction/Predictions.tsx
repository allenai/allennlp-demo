import React from 'react';
import styled from 'styled-components';

import { DebugInfo } from '../../components';
import {
    Output,
    HighlightContainer,
    Highlight,
    HighlightColor,
    formatTokens,
    FormattedToken,
} from '../../tugboat/components';
import { Input, Prediction } from './types';
import { Model } from '../../tugboat/lib';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    return (
        <Output.Section>
            <Output.SubSection title="Extracted Verbs">
                {output.verbs.map((verbData, i) => {
                    return (
                        <Extraction key={verbData.verb}>
                            <b>Extractions for '{verbData.verb}':</b>
                            <HighlightContainer centerLabels={false} key={i}>
                                {formatTokens(verbData.tags, output.words).map((token, i) => (
                                    <TokenSpan key={i} id={i} token={token} />
                                ))}
                            </HighlightContainer>
                        </Extraction>
                    );
                })}
            </Output.SubSection>

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const TokenSpan = ({ token, id }: { token: FormattedToken; id: number }) => {
    if (token.entity !== undefined) {
        const tagParts = token.entity.split('-');
        const [tagLabel, attr] = tagParts;

        // Convert the tag label to a node type. In the long run this might make sense as
        // a map / lookup table of some sort -- but for now this works.
        let color: HighlightColor = 'O';
        let nodeType = tagLabel;
        if (tagLabel === 'ARGM') {
            nodeType = 'modifier';
            color = 'T';
        } else if (tagLabel === 'ARGA') {
            nodeType = 'argument';
            color = 'M';
        } else if (/ARG\d+/.test(tagLabel)) {
            nodeType = 'argument';
            color = 'G';
        } else if (tagLabel === 'R') {
            nodeType = 'reference';
            color = 'P';
        } else if (tagLabel === 'C') {
            nodeType = 'continuation';
            color = 'A';
        } else if (tagLabel === 'V') {
            nodeType = 'verb';
            color = 'B';
        }

        let attribute;
        const isArg = nodeType === 'argument';
        if (isArg) {
            attribute = tagLabel.slice(3);
        } else if (attr) {
            attribute = attributeToDisplayLabel[attr];
        }
        let label = nodeType;
        if (attribute) {
            label += `-${attribute}`;
        }
        // If token has entity value:
        // Display entity text wrapped in a <Highlight /> component.
        return (
            <Highlight id={id} label={label} color={color}>
                {token.text}{' '}
            </Highlight>
        );
    } else {
        // If no entity,
        // Display raw text.
        return <span>{`${token.text}${' '}`}</span>;
    }
};

const attributeToDisplayLabel: { [index: string]: string } = {
    PRP: 'Purpose',
    COM: 'Comitative',
    LOC: 'Location',
    DIR: 'Direction',
    GOL: 'Goal',
    MNR: 'Manner',
    TMP: 'Temporal',
    EXT: 'Extent',
    REC: 'Reciprocal',
    PRD: 'Secondary Predication',
    CAU: 'Cause',
    DIS: 'Discourse',
    MOD: 'Modal',
    NEG: 'Negation',
    DSP: 'Direct Speech',
    LVB: 'Light Verb',
    ADV: 'Adverbial',
    ADJ: 'Adjectival',
    PNC: 'Purpose not cause',
};

const Extraction = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};
`;
