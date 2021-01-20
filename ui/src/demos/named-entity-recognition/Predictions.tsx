import React from 'react';

import { DebugInfo } from '../../components';
import {
    Highlight,
    HighlightColor,
    HighlightContainer,
    Output,
    FormattedToken,
    formatTokens,
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
            <Output.SubSection title="Entities">
                <HighlightContainer centerLabels={false}>
                    {formatTokens(output.tags, output.words).map((token, i) => (
                        <TokenSpan key={i} id={i} token={token} />
                    ))}
                </HighlightContainer>
            </Output.SubSection>
            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const TokenSpan = ({ token, id }: { token: FormattedToken; id: number }) => {
    if (token.entity === undefined) {
        // If no entity,
        // Display raw text.
        return <span>{`${token.text}${' '}`}</span>;
    }

    // If token has entity value:
    // Display entity text wrapped in a <Highlight /> component.
    return (
        <Highlight
            id={id}
            label={token.entity}
            color={entityLookup[token.entity].color}
            tooltip={entityLookup[token.entity].tooltip}>
            {token.text}{' '}
        </Highlight>
    );
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
