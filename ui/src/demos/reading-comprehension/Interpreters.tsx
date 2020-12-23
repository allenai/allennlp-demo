import React from 'react';
import { Collapse } from 'antd';

import { PrettyPrintedJSON } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import { Interpret } from '../../components';
import { ModelId } from '../../lib';
import { Input } from './types';

interface Props {
    model: Model;
    input: Input;
}

export const Interpreters = ({ model, input }: Props) => {
    // NMN doesn't support the interpret endpoints.
    if (model.id === ModelId.Nmn) {
        return null;
    }
    return (
        <Collapse>
            <Collapse.Panel key="simple" header="Simple Gradient Visualization">
                <Interpret<Input, any> interpreter="simple_gradient" input={input}>
                    {({ output }) => <PrettyPrintedJSON json={output} />}
                </Interpret>
            </Collapse.Panel>
            <Collapse.Panel key="integrated" header="Integrated Gradients Visualization">
                <Interpret<Input, any> interpreter="integrated_gradient" input={input}>
                    {({ output }) => <PrettyPrintedJSON json={output} />}
                </Interpret>
            </Collapse.Panel>
            <Collapse.Panel key="smooth" header="SmoothGrad Visualization">
                <Interpret<Input, any> interpreter="smooth_gradient" input={input}>
                    {({ output }) => <PrettyPrintedJSON json={output} />}
                </Interpret>
            </Collapse.Panel>
        </Collapse>
    );
};
