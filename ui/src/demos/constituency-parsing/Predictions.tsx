import React from 'react';
import { Output } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';

import { DebugInfo, Hierplane } from '../../components';
import { Input, Prediction } from './types';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    // TODO: this is a placeholder visualization. We will be removing Hierplane someday soon!
    return (
        <Output.Section>
            {output.hierplane_tree ? (
                <Output.SubSection>
                    <Hierplane tree={output.hierplane_tree} theme="light" />
                </Output.SubSection>
            ) : (
                <span>Unable to render output. See CLI Output below.</span>
            )}

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
