import React from 'react';
import styled from 'styled-components';
import { List } from 'antd';

import {
    Output,
    HighlightContainer,
    Highlight,
    HighlightColor,
    formatTokens,
    FormattedToken,
} from '../tugboat/components';

interface VerbData {
    description: string;
    tags: string[];
    verb: string;
}

export interface TokenExtractionPrediction {
    verbs: VerbData[];
    words: string[];
}

interface Props {
    output: TokenExtractionPrediction;
}

export const TokenExtraction = ({ output }: Props) => {
    return (
        <Output.SubSection title={`${output.verbs.length} Total Extractions`}>
            <List
                itemLayout="vertical"
                size="small"
                dataSource={output.verbs}
                pagination={output.verbs.length > 9 ? { pageSize: 7 } : false}
                renderItem={(verbData, i) => {
                    return (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <>
                                        <b>Extractions for </b>
                                        <Verb>
                                            <Highlight id={i} color="B">
                                                {verbData.verb}
                                            </Highlight>
                                        </Verb>
                                        :
                                    </>
                                }
                            />
                            <StyledHighlightContainer centerLabels={false}>
                                {formatTokens(verbData.tags, output.words).map((token, i) => (
                                    <TokenSpan key={i} id={i} token={token} />
                                ))}
                            </StyledHighlightContainer>
                        </List.Item>
                    );
                }}
            />
        </Output.SubSection>
    );
};

const TokenSpan = ({ token, id }: { token: FormattedToken; id: number }) => {
    if (token.entity === undefined) {
        // If no entity,
        // Display raw text.
        return <span>{`${token.text}${' '}`}</span>;
    }

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

const Verb = styled.span`
    display: inline-flex;
`;

const StyledHighlightContainer = styled(HighlightContainer)`
    margin-left: ${({ theme }) => theme.spacing.md};
`;
