import React from 'react';
import { Output } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';

import { DebugInfo, TokenExtraction } from '../../components';
import { Input, Prediction } from './types';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    return (
        <Output.Section>
            <TokenExtraction output={output} extractionLabel="Frames" />

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
