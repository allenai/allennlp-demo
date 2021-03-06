import React from 'react';
import Collapse from 'antd/es/collapse';
import { Output } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';

import {
    Attack,
    InputReduction,
    InputReductionAttackOutput,
    Hotflip,
    HotflipAttackOutput,
} from '.';
import { ModelInfoList, findModelInfo } from '../context';
import { AttackType } from '../lib';
import { CollapsePanel } from './CollapsePanel';

interface Props<I, O> {
    input: I;
    model: Model;
    prediction: O;
    target: keyof I & string;
    gradient?: string;
    children?: (pred: O) => React.ReactNode | JSX.Element;
}

export const Attackers = <I, O>({
    input,
    model,
    target,
    prediction,
    gradient = 'grad_input_2',
    children,
}: Props<I, O>) => {
    const modelInfoList = React.useContext(ModelInfoList);
    const info = findModelInfo(modelInfoList, model);
    if (info.attackers.length === 0) {
        return null;
    }

    const supportedAttackTypes = new Set(info.attackers);

    return (
        <Output.Section title="Model Attacks">
            <Collapse>
                {supportedAttackTypes.has(AttackType.InputReduction) ? (
                    <CollapsePanel key={AttackType.InputReduction} header="Input Reduction">
                        <Attack<I, InputReductionAttackOutput>
                            type={AttackType.InputReduction}
                            target={target}
                            gradient={gradient}
                            input={input}
                            label="Reduce Input"
                            description={
                                <p>
                                    <a
                                        href="https://arxiv.org/abs/1804.07781"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        Input Reduction
                                    </a>{' '}
                                    removes as many words from the input as possible without
                                    changing the model's prediction.
                                </p>
                            }>
                            {(output) => <InputReduction {...output} />}
                        </Attack>
                    </CollapsePanel>
                ) : null}
                {supportedAttackTypes.has(AttackType.HotFlip) ? (
                    <CollapsePanel key={AttackType.HotFlip} header="HotFlip">
                        <Attack<I, HotflipAttackOutput<O>>
                            type={AttackType.HotFlip}
                            target={target}
                            gradient={gradient}
                            input={input}
                            label="Flip Words"
                            description={
                                <p>
                                    <a
                                        href="https://arxiv.org/abs/1712.06751"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        HotFlip
                                    </a>{' '}
                                    flips words in the input to change the model's prediction. We
                                    iteratively flip the input word with the highest gradient until
                                    the prediction changes.
                                </p>
                            }>
                            {(output) => (
                                <Hotflip
                                    newTokens={output.final ? output.final[0] : undefined}
                                    originalTokens={output.original}
                                    newPrediction={
                                        children && output.outputs.length
                                            ? children(output.outputs[0])
                                            : undefined
                                    }
                                    originalPrediction={children ? children(prediction) : undefined}
                                />
                            )}
                        </Attack>
                    </CollapsePanel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
