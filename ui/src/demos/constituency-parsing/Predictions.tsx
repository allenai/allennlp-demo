import React from 'react';

import { DebugInfo, Hierplane } from '../../components';
import { Output } from '../../tugboat/components';
import { Input, Prediction } from './types';
import { Model } from '../../tugboat/lib';

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
                <span>Unable to render output. See debug output below.</span>
            )}

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
