import React from 'react';

import { DebugInfo } from '../../components';
import { Output, NestedHighlight, withHighlightClickHandling } from '../../tugboat/components';
import { Input, Prediction } from './types';
import { Model } from '../../tugboat/lib';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    const { document, clusters } = output;
    return (
        <Output.Section>
            <Output.SubSection>
                <NestedHighlightwithHighlightClickHandling
                    clusters={toDict(clusters)}
                    tokens={document}
                    isClickable
                    labelPosition="left"
                />
            </Output.SubSection>

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const toDict = <T,>(data: T[]) => {
    return data.reduce((a, x, i) => ({ ...a, [i]: x }), {});
};

const NestedHighlightwithHighlightClickHandling = withHighlightClickHandling(NestedHighlight);
