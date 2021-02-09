import React from 'react';
import { Collapse, Popover } from 'antd';
import { Output, HelpContent, PopoverTarget } from '@allenai/tugboat/components';
import { Models } from '@allenai/tugboat/context';
import { NoSelectedModelError } from '@allenai/tugboat/error';

import { Interpret } from '.';
import { ModelInfoList, findModelInfo } from '../context';
import { InterpreterId } from '../lib';
interface Props<I, O> {
    input: I;
    children: (output: O) => React.ReactNode;
}

export const Interpreters = <I, O>({ input, children }: Props<I, O>) => {
    const modelInfoList = React.useContext(ModelInfoList);
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModelError();
    }

    const info = findModelInfo(modelInfoList, models.selectedModel);
    if (info.interpreters.length === 0) {
        return null;
    }

    const supportedInterpreters = new Set(info.interpreters);

    const title = 'Model Interpretations';
    const helpContent = (
        <HelpContent>
            <p>
                Despite constant advances and seemingly super-human performance on constrained
                domains, state-of-the-art models for NLP are imperfect. These imperfections, coupled
                with today's advances being driven by (seemingly black-box) neural models, leave
                researchers and practitioners scratching their heads asking,{' '}
                <i>why did my model make this prediction?</i>
            </p>
            <a href="https://allennlp.org/interpret" target="_blank" rel="noopener noreferrer">
                Learn More
            </a>
        </HelpContent>
    );

    return (
        <Output.Section
            title={title}
            extra={
                <Popover content={helpContent} title={<strong>{title}</strong>}>
                    <PopoverTarget>What is this?</PopoverTarget>
                </Popover>
            }>
            <Collapse>
                {supportedInterpreters.has(InterpreterId.SimpleGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SimpleGradient}
                        header="Simple Gradient Visualization">
                        <Interpret<I, O>
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
                            {(output) => children(output)}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.IntegratedGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.IntegratedGradient}
                        header="Integrated Gradient Visualization">
                        <Interpret<I, O>
                            interpreter={InterpreterId.IntegratedGradient}
                            input={input}
                            description={
                                <p>
                                    See saliency map interpretations generated using{' '}
                                    <a
                                        href="https://arxiv.org/abs/1703.01365"
                                        target="_blank"
                                        rel="noopener,noreferrer">
                                        Integrated Gradients
                                    </a>
                                    .
                                </p>
                            }>
                            {(output) => children(output)}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
                {supportedInterpreters.has(InterpreterId.SmoothGradient) ? (
                    <Collapse.Panel
                        key={InterpreterId.SmoothGradient}
                        header="Smooth Gradient Visualization">
                        <Interpret<I, O>
                            interpreter={InterpreterId.SmoothGradient}
                            input={input}
                            description={
                                <p>
                                    See saliency map interpretations generated using{' '}
                                    <a
                                        href="https://arxiv.org/abs/1706.03825"
                                        target="_blank"
                                        rel="noopener,noreferrer">
                                        SmoothGrad
                                    </a>
                                    .
                                </p>
                            }>
                            {(output) => children(output)}
                        </Interpret>
                    </Collapse.Panel>
                ) : null}
            </Collapse>
        </Output.Section>
    );
};
