import React from 'react';
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
    Submit,
} from '../../tugboat/components';
import { MultiModelDemo, Predict, Interpreters, Attackers } from '../../components';
import { isWithTokenizedInput } from '../../lib';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Input, Prediction, getBasicAnswer } from './types';

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
                                    <Predictions model={model} input={input} output={output} />
                                    {isWithTokenizedInput(output) ? (
                                        <Interpreters model={model} input={input} tokens={output} />
                                    ) : null}
                                    <Attackers
                                        model={model}
                                        input={input}
                                        prediction={output}
                                        target="question">
                                        {(pred) => getBasicAnswer(pred)}
                                    </Attackers>
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
