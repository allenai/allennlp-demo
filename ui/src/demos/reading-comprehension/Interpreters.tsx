import React from 'react';
import { Collapse } from 'antd';

import { PrettyPrintedJSON } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import { Interpret, Interpreter } from '../../components';
import { ModelId, SaliencyComponent } from '../../lib';
import { Input, Prediction } from './types';

interface Props {
    model: Model;
    input: Input;
    prediction: Prediction;
}

export const Interpreters = ({ model, input, prediction }: Props) => {
    // NMN doesn't support the interpret endpoints.
    if (model.id === ModelId.Nmn) {
        return null;
    }
    return (
        <Collapse>
            <Collapse.Panel key="simple" header="Simple Gradient Visualization">
                <Interpret<Input, any> interpreter={Interpreter.GRAD_INTERPRETER} input={input}>
                    {({ output }) => (
                        <>
                            {/* TODO: get tokens */}
                            <SaliencyComponent
                                interpretData={[
                                    output.instance_1.grad_input_2,
                                    output.instance_1.grad_input_1,
                                ]}
                                inputTokens={[
                                    (prediction as any).question_tokens,
                                    (prediction as any).passage_tokens,
                                ]}
                                inputHeaders={[<div>Question</div>, <div>Passage</div>]}
                                interpreter={Interpreter.GRAD_INTERPRETER}
                            />
                            DEBUG
                            <PrettyPrintedJSON json={output} />
                        </>
                    )}
                </Interpret>
            </Collapse.Panel>
            <Collapse.Panel key="integrated" header="Integrated Gradients Visualization">
                <Interpret<Input, any> interpreter={Interpreter.IG_INTERPRETER} input={input}>
                    {({ output }) => (
                        <>
                            {/* TODO add viz */}
                            <PrettyPrintedJSON json={output} />
                        </>
                    )}
                </Interpret>
            </Collapse.Panel>
            <Collapse.Panel key="smooth" header="SmoothGrad Visualization">
                <Interpret<Input, any> interpreter={Interpreter.SG_INTERPRETER} input={input}>
                    {({ output }) => (
                        <>
                            {/* TODO add viz */}
                            <PrettyPrintedJSON json={output} />
                        </>
                    )}
                </Interpret>
            </Collapse.Panel>
        </Collapse>
    );
};
