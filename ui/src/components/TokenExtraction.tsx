import React from 'react';
import styled from 'styled-components';
import { List } from 'antd';
import {
    HighlightContainer,
    Highlight,
    HighlightColor,
    formatTokens,
    FormattedToken,
    Output,
} from '@allenai/tugboat/components';

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
    extractionLabel?: string;
}

export const TokenExtraction = ({ output, extractionLabel = 'Extractions' }: Props) => {
    return (
        <Output.SubSection title={`${output.verbs.length} Total ${extractionLabel}`}>
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
                                        <b>{extractionLabel} for </b>
                                        <Extraction>
                                            <Highlight id={i} color="B">
                                                {verbData.verb}
                                            </Highlight>
                                        </Extraction>
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
        nodeType = 'Modifier';
        color = 'T';
    } else if (tagLabel === 'ARGA') {
        nodeType = 'Argument';
        color = 'M';
    } else if (/ARG\d+/.test(tagLabel)) {
        nodeType = 'Argument';
        color = 'G';
    } else if (tagLabel === 'R') {
        nodeType = 'Reference';
        color = 'P';
    } else if (tagLabel === 'C') {
        nodeType = 'Continuation';
        color = 'A';
    } else if (tagLabel === 'V') {
        nodeType = 'Verb';
        color = 'B';
    }

    let attribute;
    const isArg = nodeType === 'argument';
    if (isArg) {
        attribute = tagLabel.slice(3);
    } else if (attr) {
        attribute = attributeToDisplayLabel[attr];
    }
    let tooltip = nodeType;
    if (attribute) {
        tooltip += `-${attribute}`;
    }

    // Display entity text wrapped in a <Highlight /> component.
    return (
        <Highlight id={id} label={token.entity} color={color} tooltip={tooltip}>
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

const Extraction = styled.span`
    display: inline-flex;
`;

const StyledHighlightContainer = styled(HighlightContainer)`
    margin-left: ${({ theme }) => theme.spacing.md};
`;
