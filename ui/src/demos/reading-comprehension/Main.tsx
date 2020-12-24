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
} from '../../tugboat/components';
import { MultiModelDemo, Predict, Interpreters } from '../../components';
import { isWithTokenizedInput } from '../../lib';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Attacks } from './Attacks';
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
                                        <Predictions model={model} input={input} output={output} />
                                        {isWithTokenizedInput(output) ? (
                                            <Interpreters
                                                model={model}
                                                input={input}
                                                tokens={output}
                                            />
                                        ) : null}
                                        <Attacks model={model} input={input} />
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
