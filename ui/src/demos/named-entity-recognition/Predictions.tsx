import React from 'react';

import { DebugInfo } from '../../components';
import { Highlight, HighlightColor, HighlightContainer, Output } from '../../tugboat/components';
import { Input, Prediction } from './types';
import { Model } from '../../tugboat/lib';

interface FormattedToken {
    text: string;
    entity?: string;
}

enum TokenSequence {
    B = 'B', // "Beginning" (first token in a sequence of tokens comprising an entity)
    I = 'I', // "Inside" (token in a sequence of tokens (that isn't first or last in its sequence) comprising an entity)
    L = 'L', // "Last" (last token in a sequence of tokens comprising an entity)
    O = 'O', // "Outside" (token that isn't associated with any entities)
    U = 'U', // "Unit" (A single token representing a single entity)
}

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    const { words, tags } = output;

    // Defining an empty array for building a list of formatted token objects.
    const formattedTokens: FormattedToken[] = [];
    // Defining an empty string to store temporary span text (this field is used to build up the entire text in a single BIL span).
    let spanStr = '';
    // Iterate through array of tags from response data.
    tags.forEach(function (tag, i) {
        // Defining an empty object to store temporary token data.
        let tokenObj: FormattedToken;
        if (tag === TokenSequence.O) {
            // If this tag is not part of an entity:
            // Build token object using this token's word and set entity to null.
            tokenObj = {
                text: words[i],
            };
            // Append array of formatted token objects with this token object.
            formattedTokens.push(tokenObj);
        } else if (tag[0] === TokenSequence.U) {
            // If this tag is a unit token:
            // Build token object using this token's word and entity.
            tokenObj = {
                text: words[i],
                entity: tag.slice(2), // tag value with "U-" stripped from the beginning
            };
            // Append array of formatted token objects with this token object.
            formattedTokens.push(tokenObj);
        } else if (tag[0] === TokenSequence.B) {
            // If this tag is beginning of a span:
            // Reset span string to current token's word.
            spanStr = `${words[i]}`;
        } else if (tag[0] === TokenSequence.I) {
            // If this tag is inside a span:
            // Append current word to span string w/ space at beginning.
            spanStr += ` ${words[i]} `;
        } else if (tag[0] === TokenSequence.L) {
            // If this tag is last in a span:
            // Append current word to span string w/ space at beginning.
            spanStr += ` ${words[i]}`;
            // Build token object using final span string and entity tag for this token.
            tokenObj = {
                text: spanStr,
                entity: tag.slice(2), // tag value with "L-" stripped from the beginning
            };
            // Append array of formatted token objects with this token object.
            formattedTokens.push(tokenObj);
        }
    });

    return (
        <Output.Section title="Model Output">
            <Output.SubSection title="Entities">
                <HighlightContainer centerLabels={false}>
                    {formattedTokens.map((token, i) => (
                        <TokenSpan key={i} id={i} token={token} />
                    ))}
                </HighlightContainer>
            </Output.SubSection>
            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const TokenSpan = ({ token, id }: { token: FormattedToken; id: number }) => {
    const entity = token.entity;

    if (entity !== undefined) {
        // If token has entity value:
        // Display entity text wrapped in a <Highlight /> component.
        return (
            <Highlight
                id={id}
                label={entity}
                color={entityLookup[entity].color}
                tooltip={entityLookup[entity].tooltip}>
                {token.text}{' '}
            </Highlight>
        );
    } else {
        // If no entity,
        // Display raw text.
        return <span>{token.text}</span>;
    }
};

// Lookup table for entity style values
const entityLookup: {
    [id: string]: {
        tooltip: string;
        color: HighlightColor;
    };
} = {
    PER: {
        tooltip: 'Person',
        color: 'M',
    },
    LOC: {
        tooltip: 'Location',
        color: 'G',
    },
    ORG: {
        tooltip: 'Organization',
        color: 'B',
    },
    MISC: {
        tooltip: 'Miscellaneous',
        color: 'A',
    },
    PERSON: {
        tooltip: 'Person',
        color: 'M',
    },
    CARDINAL: {
        tooltip: 'Cardinal Number',
        color: 'O',
    },
    EVENT: {
        tooltip: 'Event',
        color: 'G',
    },
    DATE: {
        tooltip: 'Date',
        color: 'P',
    },
    FAC: {
        tooltip: 'Facility',
        color: 'A',
    },
    GPE: {
        tooltip: 'Country/City/State',
        color: 'T',
    },
    LANGUAGE: {
        tooltip: 'Language',
        color: 'R',
    },
    LAW: {
        tooltip: 'Law',
        color: 'O',
    },
    // LOC - see above
    MONEY: {
        tooltip: 'Monetary Value',
        color: 'O',
    },
    NORP: {
        tooltip: 'Nationalities, Religious/Political Groups',
        color: 'G',
    },
    ORDINAL: {
        tooltip: 'Ordinal Value',
        color: 'O',
    },
    // ORG - see above.
    PERCENT: {
        tooltip: 'Percentage',
        color: 'O',
    },
    PRODUCT: {
        tooltip: 'Product',
        color: 'P',
    },
    QUANTITY: {
        tooltip: 'Quantity',
        color: 'O',
    },
    TIME: {
        tooltip: 'Time',
        color: 'M',
    },
    WORK_OF_ART: {
        tooltip: 'Work of Art/Media',
        color: 'A',
    },
};
