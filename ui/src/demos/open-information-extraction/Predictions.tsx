import React from 'react';

import { DebugInfo, TokenExtraction } from '../../components';
import { Output } from '../../tugboat/components';
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
            <Output.SubSection title={`${output.verbs.length} Total Extractions`}>
                <TokenExtraction output={output} />
            </Output.SubSection>

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
