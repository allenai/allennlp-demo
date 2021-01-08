import React from 'react';
import { Collapse } from 'antd';

import { Output } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import {
    Attack,
    InputReduction,
    InputReductionAttackOutput,
    Hotflip,
    HotflipAttackOutput,
} from '../../components';
import { ModelInfoList } from '../../context';
import { AttackType, GradientInputField } from '../../lib';
import { Input, Prediction, getBasicAnswer } from './types';

// TODO: this file can likely be made general for use on multiple tasks

interface Props {
    model: Model;
    input: Input;
    prediction: Prediction;
    target: keyof Input & string;
}

export const Attacks = ({ model, input, target, prediction }: Props) => {
    const modelInfoList = React.useContext(ModelInfoList);

    const info = modelInfoList.find((i) => i.id === model.id);
    if (!info || info.attackers.length === 0) {
        return null;
    }

    const supportedAttackTypes = new Set(info.attackers);

    return (
        <Output.Section title="Model Attacks">
            <Collapse>
                {supportedAttackTypes.has(AttackType.InputReduction) ? (
                    <Collapse.Panel key={AttackType.InputReduction} header="Input Reduction">
                        <Attack<Input, InputReductionAttackOutput>
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
                            {({ output }) => <InputReduction {...output} />}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
                {supportedAttackTypes.has(AttackType.HotFlip) ? (
                    <Collapse.Panel key={AttackType.HotFlip} header="HotFlip">
                        <Attack<Input, HotflipAttackOutput<Prediction>>
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
                            {({ output }) => (
                                <Hotflip
                                    newTokens={output.final ? output.final[0] : undefined}
                                    originalTokens={output.original}
                                    newPrediction={
                                        output.outputs.length
                                            ? getBasicAnswer(output.outputs[0])
                                            : undefined
                                    }
                                    originalPrediction={getBasicAnswer(prediction)}
                                />
                            )}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
