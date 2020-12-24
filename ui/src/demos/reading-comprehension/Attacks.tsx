import React from 'react';
import { Collapse } from 'antd';

import { Output, PrettyPrintedJSON } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import { Attack } from '../../components';
import { ModelInfoList } from '../../context';
import { AttackType, GradientInputField } from '../../lib';
import { Input } from './types';

interface Props {
    model: Model;
    input: Input;
}

/**
 * TODO: Bits and pieces of this can and should move into `../../components` so that other demos
 * that support attacks can use this code. The bit we need to figure out before doing so it
 * what the output looks like, and how generic it actually is.
 */
export const Attacks = ({ model, input }: Props) => {
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
                        {/* TODO: Replace `any` with a better type once we know what it is. */}
                        <Attack<Input, any>
                            type={AttackType.InputReduction}
                            target="question"
                            gradient={GradientInputField.Input2}
                            input={input}>
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
                {supportedAttackTypes.has(AttackType.HotFlip) ? (
                    <Collapse.Panel key={AttackType.HotFlip} header="HotFlip">
                        {/* TODO: Replace `any` with a better type once we know what it is. */}
                        <Attack<Input, any>
                            type={AttackType.HotFlip}
                            target="question"
                            gradient={GradientInputField.Input2}
                            input={input}>
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Attack>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
