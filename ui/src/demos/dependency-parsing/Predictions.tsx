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
    /*
    // TODO: remove this once we decide to replace Hierplane
    // this code is an example of a hardcoded nestedhighlight
    const exampleExpandedClusters = {
        verb: [
            [1, 1],
            [5, 5],
        ],
        propn: [[0, 0]],
        nsubj: [[0, 0]],
        dep: [
            [2, 4],
            [5, 8],
            [2, 2],
            [3, 3],
        ],
        sconj: [[4, 4]],
        prep: [[6, 8]],
        adp: [[6, 6]],
        probj: [[7, 8]],
        noun: [
            [8, 8],
            [3, 3],
        ],
        amod: [[7, 7]],
        det: [
            [7, 7],
            [2, 2],
        ],
        punct: [
            [9, 9],
            [9, 9],
        ],
    };

    <Output.SubSection title="Alternative view">
        <NestedHighlight clusters={exampleExpandedClusters} tokens={output.words} />
    </Output.SubSection>
    */

    // TODO: this is a placeholder visualization. We will be removing Hierplane someday soon!
    return (
        <Output.Section>
            {output.hierplane_tree ? (
                <Output.SubSection>
                    <Hierplane tree={output.hierplane_tree} theme="light" />
                </Output.SubSection>
            ) : (
                <span>Unable to render output. See API Output below.</span>
            )}

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
