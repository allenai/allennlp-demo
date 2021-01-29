import React from 'react';

import { DebugInfo } from '../../components';
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
            <SummaryText output={output} />

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const SummaryText = ({ output }: { output: Prediction }) => {
    const [positive, negative] = output.probs;

    const judgments = {
        negative: (
            <span>
                the sentence has a <strong>negative</strong> sentiment
            </span>
        ),
        positive: (
            <span>
                the sentence has a <strong>positive</strong> sentiment
            </span>
        ),
    };

    // Find judgment and confidence.
    let judgment;
    let confidence;

    if (negative > positive) {
        judgment = judgments.negative;
        confidence = negative;
    } else {
        judgment = judgments.positive;
        confidence = positive;
    }

    // Create summary text.
    const veryConfident = 0.75;
    const somewhatConfident = 0.5;
    let summaryText;

    if (confidence >= veryConfident) {
        summaryText = (
            <div>
                The model is <strong>very confident</strong> that {judgment}.
            </div>
        );
    } else if (confidence >= somewhatConfident) {
        summaryText = (
            <div>
                The model is <strong>somewhat confident</strong> that {judgment}.
            </div>
        );
    } else {
        summaryText = <div>The model is not confident in its judgment.</div>;
    }

    return (
        <>
            <Output.SubSection>{summaryText}</Output.SubSection>
        </>
    );
};
