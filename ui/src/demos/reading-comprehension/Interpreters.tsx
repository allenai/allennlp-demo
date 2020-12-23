import React from 'react';
import { Collapse } from 'antd';

import { Output, PrettyPrintedJSON } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import { Interpret } from '../../components';
import { ModelInfoList } from '../../context';
import { InterpreterId } from '../../lib';
import { Input } from './types';

interface Props {
    model: Model;
    input: Input;
}

/**
 * TODO: Bits and pieces of this can and should move into `../../components` so that other demos
 * that support intepretation can use this code. The bit we need to figure out before doing so it
 * what the output looks like, and how generic it actually is.
 */
export const Interpreters = ({ model, input }: Props) => {
    const modelInfoList = React.useContext(ModelInfoList);

    const info = modelInfoList.find((i) => i.id === model.id);
    if (!info || info.interpreters.length === 0) {
        return null;
    }

    const supportedInterpreters = new Set(info.interpreters);

    return (
        <Output.Section title="Model Interpretations">
            <Collapse>
                {supportedInterpreters.has(InterpreterId.SimpleGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SimpleGradient}
                        header="Simple Gradient Visualization">
                        <Interpret<Input, any>
                            interpreter={InterpreterId.SimpleGradient}
                            input={input}>
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.IntegratedGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.IntegratedGradient}
                        header="Integrated Gradient Visualization">
                        <Interpret<Input, any>
                            interpreter={InterpreterId.IntegratedGradient}
                            input={input}>
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.SmoothGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SmoothGradient}
                        header="Smooth Gradient Visualization">
                        <Interpret<Input, any>
                            interpreter={InterpreterId.SmoothGradient}
                            input={input}>
                            {({ output }) => <PrettyPrintedJSON json={output} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
