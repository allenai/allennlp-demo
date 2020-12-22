import React from 'react';
import { Tabs } from 'antd';

import { Content } from '@allenai/varnish/components';

import {
    TaskTitle,
    TaskDescription,
    ModelCard,
    Output,
    SelectModel,
    SelectExample,
    Fields,
    Question,
    Passage,
    Submit,
    PrettyPrintedJSON,
} from '../../tugboat/components';
import { MultiModelDemo, Predict, Interpret } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Input, Prediction } from './types';

export const Main = () => {
    return (
        <Content>
            <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
                <TaskTitle />
                <TaskDescription />
                <SelectModel />
                <Tabs>
                    <Tabs.TabPane tab="Demo" key="Demo">
                        <SelectExample displayProp="question" placeholder="Select a Question…" />
                        <Predict<Input, Prediction>>
                            <Fields>
                                <Passage />
                                <Question />
                                <Submit>Run Model</Submit>
                            </Fields>
                            <Output<Input, Prediction>>
                                {({ model, input, output }) => (
                                    <Output.Sections>
                                        <Output.Section title="Model Predictions">
                                            <Predictions
                                                model={model}
                                                input={input}
                                                output={output}
                                            />
                                        </Output.Section>
                                        <Output.Section title="Model Interpretations">
                                            <Interpret<Input, any>
                                                interpreter="simple_gradient"
                                                input={input}>
                                                {({ output }) => (
                                                    <PrettyPrintedJSON json={output} />
                                                )}
                                            </Interpret>
                                        </Output.Section>
                                    </Output.Sections>
                                )}
                            </Output>
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
