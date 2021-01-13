import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';
import { Content } from '@allenai/varnish/components';

import {
    TaskTitle,
    TaskDescription,
    ModelCard,
    Output,
    SelectModelAndDescription,
    SelectExample,
    Question,
    Passage,
    ShareLink,
    Submit,
} from '../../tugboat/components';
import { MultiModelDemo, Predict, Interpreters } from '../../components';
import { isWithTokenizedInput } from '../../lib';
import { config } from './config';
import { Usage } from './Usage';
import { Attacks } from './Attacks';
import { Predictions } from './Predictions';
import { Input, Prediction } from './types';

export const Main = () => {
    return (
        <Content>
            <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
                <TaskTitle />
                <TaskDescription />
                <SelectModelAndDescription />
                <Tabs>
                    <Tabs.TabPane tab="Demo" key="Demo">
                        <SelectExample displayProp="question" placeholder="Select a Question…" />
                        <Predict<Input, Prediction>
                            fields={
                                <>
                                    <Passage />
                                    <Question />
                                    <Submit>Run Model</Submit>
                                </>
                            }>
                            {({ model, input, output }) => (
                                <Output>
                                    <Output.Section
                                        title="Model Output"
                                        extra={
                                            <AlignRight>
                                                <ShareLink
                                                    input={input}
                                                    type="reading-comprehension-v1"
                                                    slug={ShareLink.slug(input.question)}
                                                    app="allennlp-demo" />
                                            </AlignRight>
                                        }>
                                        <Predictions model={model} input={input} output={output} />
                                        {isWithTokenizedInput(output) ? (
                                            <Interpreters
                                                model={model}
                                                input={input}
                                                tokens={output}
                                            />
                                        ) : null}
                                        <Attacks
                                            model={model}
                                            input={input}
                                            prediction={output}
                                            target="question"
                                        />
                                    </Output.Section>
                                </Output>
                            )}
                        </Predict>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Model Card" key="Card">
                        <ModelCard />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Model Usage" key="Usage">
                        <Usage />
                    </Tabs.TabPane>
                </Tabs>
            </MultiModelDemo>
        </Content>
    );
};

const AlignRight = styled.span`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;
