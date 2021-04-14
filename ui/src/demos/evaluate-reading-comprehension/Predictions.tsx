import React from 'react';
import { Output } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';

import { DebugInfo } from '../../components';
import { Input, Prediction } from './types';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    return (
        <Output.Section>
            <Output.SubSection title="Predicted Score">
                <div>{output.pred_score}</div>
            </Output.SubSection>

            <Output.SubSection title="Context">
                <div>{input.context}</div>
            </Output.SubSection>

            <Output.SubSection title="Question">
                <div>{input.question}</div>
            </Output.SubSection>

            <Output.SubSection title="Reference Answer">
                <div>{input.reference}</div>
            </Output.SubSection>

            <Output.SubSection title="Candidate Answer">
                <div>{input.candidate}</div>
            </Output.SubSection>

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
