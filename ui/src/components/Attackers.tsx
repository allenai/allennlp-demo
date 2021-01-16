import React from 'react';
import { Collapse } from 'antd';

import { Output } from '../tugboat/components';
import { Model } from '../tugboat/lib';

import {
    Attack,
    InputReduction,
    InputReductionAttackOutput,
    Hotflip,
    HotflipAttackOutput,
} from '.';
import { ModelInfoList, findModelInfo } from '../context';
import { AttackType, GradientInputField } from '../lib';

interface Props<I, O> {
    input: I;
    model: Model;
    prediction: O;
    target: keyof I & string;
    children?: (pred: O) => React.ReactNode | JSX.Element;
}

export const Attackers = <I, O>({ input, model, target, prediction, children }: Props<I, O>) => {
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
                    <Collapse.Panel key={AttackType.InputReduction} header="Input Reduction">
                        <Attack<I, InputReductionAttackOutput>
                            type={AttackType.InputReduction}
                            target={target}
                            gradient={GradientInputField.Input2}
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
                    </Collapse.Panel>
                ) : null}
                {supportedAttackTypes.has(AttackType.HotFlip) ? (
                    <Collapse.Panel key={AttackType.HotFlip} header="HotFlip">
                        <Attack<I, HotflipAttackOutput<O>>
                            type={AttackType.HotFlip}
                            target={target}
                            gradient={GradientInputField.Input2}
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
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
