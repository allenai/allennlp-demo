import React from 'react';
import { Collapse } from 'antd';

import { Output, PrettyPrintedJSON } from '../tugboat/components';
import { Model } from '../tugboat/lib';

import { Attack } from './Attack';
import { ModelInfoList } from '../context';
import { AttackType, GradientInputField } from '../lib';

interface Props<I> {
    model: Model;
    input: I;
    target: keyof I & string;
}

export const Attacks = <I, O>({ model, input, target }: Props<I>) => {
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
                        <Attack<I, O>
                            type={AttackType.InputReduction}
                            target={target}
                            gradient={GradientInputField.Input2}
                            input={input}
                            label="Reduce Input">
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
                {supportedAttackTypes.has(AttackType.HotFlip) ? (
                    <Collapse.Panel key={AttackType.HotFlip} header="HotFlip">
                        <Attack<I, O>
                            type={AttackType.HotFlip}
                            target={target}
                            gradient={GradientInputField.Input2}
                            input={input}
                            label="Flip Words">
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
