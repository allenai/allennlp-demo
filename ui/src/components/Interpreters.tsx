import React from 'react';
import { Collapse } from 'antd';

import { Output, Saliency } from '../tugboat/components';
import { Model } from '../tugboat/lib';

import { Interpret } from '.';
import { ModelInfoList } from '../context';
import { InterpreterId } from '../lib';
import { Input } from '../demos/reading-comprehension/types';

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
        grad_input_2: number[];
    };
}

export interface InputTokens {
    passage_tokens: string[];
    question_tokens: string[];
}

export const isInputTokens = (x: any): x is InputTokens => {
    const xx = x as InputTokens;
    return Array.isArray(xx.passage_tokens) && Array.isArray(xx.question_tokens);
};

interface Props {
    model: Model;
    input: Input;
    tokens: InputTokens;
}

export const Interpreters = ({ model, input, tokens }: Props) => {
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
                        <Interpret<Input, InterpreterData>
                            interpreter={InterpreterId.SimpleGradient}
                            input={input}
                            description={
                                <p>
                                    See saliency map interpretations generated by{' '}
                                    <a
                                        href="https://arxiv.org/abs/1312.6034"
                                        target="_blank"
                                        rel="noopener,noreferrer">
                                        visualizing the gradient
                                    </a>
                                    .{' '}
                                </p>
                            }>
                            {({ output }) => <Interpreter output={output} tokens={tokens} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.IntegratedGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.IntegratedGradient}
                        header="Integrated Gradient Visualization">
                        <Interpret<Input, InterpreterData>
                            interpreter={InterpreterId.IntegratedGradient}
                            input={input}
                            description={
                                <p>
                                    See saliency map interpretations generated using{' '}
                                    <a
                                        href="https://arxiv.org/abs/1703.01365"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        Integrated Gradients
                                    </a>
                                    .
                                </p>
                            }>
                            {({ output }) => <Interpreter output={output} tokens={tokens} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.SmoothGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SmoothGradient}
                        header="Smooth Gradient Visualization">
                        <Interpret<Input, InterpreterData>
                            interpreter={InterpreterId.SmoothGradient}
                            input={input}
                            description={
                                <p>
                                    See saliency map interpretations generated using{' '}
                                    <a
                                        href="https://arxiv.org/abs/1706.03825"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        SmoothGrad
                                    </a>
                                    .
                                </p>
                            }>
                            {({ output }) => <Interpreter output={output} tokens={tokens} />}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};

export const Interpreter = ({
    output,
    tokens,
}: {
    output: InterpreterData;
    tokens: InputTokens;
}) => {
    return (
        <Saliency
            interpretData={[output.instance_1.grad_input_2, output.instance_1.grad_input_1]}
            inputTokens={[tokens.question_tokens, tokens.passage_tokens]}
            inputHeaders={[<h6>Question</h6>, <h6>Passage</h6>]}
        />
    );
};
