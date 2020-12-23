import React from 'react';
import { Collapse } from 'antd';

import { Output, PrettyPrintedJSON } from '../../tugboat/components';
import { Model } from '../../tugboat/lib';

import { Interpret } from '../../components';
import { ModelInfoList } from '../../context';
import { InterpreterId, Saliency } from '../../lib';
import { Input, Prediction } from './types';

interface Props {
    model: Model;
    input: Input;
    prediction: Prediction;
}

/**
 * TODO: Bits and pieces of this can and should move into `../../components` so that other demos
 * that support intepretation can use this code. The bit we need to figure out before doing so it
 * what the output looks like, and how generic it actually is.
 */
export const Interpreters = ({ model, input, prediction }: Props) => {
    const modelInfoList = React.useContext(ModelInfoList);

    const info = modelInfoList.find((i) => i.id === model.id);
    if (!info || info.interpreters.length === 0) {
        return null;
    }

    const supportedInterpreters = new Set(info.interpreters);

    return (
        <Output.Section
            title="Model Interpretations"
            helpLabel="What is this?"
            helpContent={
                <div>
                    <p>
                        Despite constant advances and seemingly super-human performance on
                        constrained domains, state-of-the-art models for NLP are imperfect. These
                        imperfections, coupled with today's advances being driven by (seemingly
                        black-box) neural models, leave researchers and practitioners scratching
                        their heads asking, <i>why did my model make this prediction?</i>
                    </p>
                    <a
                        href="https://allennlp.org/interpret"
                        target="_blank"
                        rel="noopener noreferrer">
                        Learn More
                    </a>
                </div>
            }>
            <Collapse>
                {supportedInterpreters.has(InterpreterId.SimpleGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SimpleGradient}
                        header="Simple Gradient Visualization">
                        <Interpret<Input, any>
                            interpreter={InterpreterId.SimpleGradient}
                            input={input}>
                            {({ output }) => (
                                <>
                                    {/* TODO: get tokens */}
                                    <Saliency
                                        interpretData={[
                                            output.instance_1.grad_input_2,
                                            output.instance_1.grad_input_1,
                                        ]}
                                        inputTokens={[
                                            (prediction as any).question_tokens,
                                            (prediction as any).passage_tokens,
                                        ]}
                                        inputHeaders={[<div>Question</div>, <div>Passage</div>]}
                                        interpreter={InterpreterId.SimpleGradient}
                                    />
                                    DEBUG
                                    <PrettyPrintedJSON json={output} />
                                </>
                            )}
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
                            {({ output }) => (
                                <>
                                    {/* TODO: add viz */}
                                    DEBUG
                                    <PrettyPrintedJSON json={output} />
                                </>
                            )}
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
                            {({ output }) => (
                                <>
                                    {/* TODO: add viz */}
                                    DEBUG
                                    <PrettyPrintedJSON json={output} />
                                </>
                            )}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
