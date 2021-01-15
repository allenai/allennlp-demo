import React from 'react';
import { Tabs } from 'antd';
import { Content } from '@allenai/varnish/components';

import {
    ModelCard,
    Output,
    Saliency,
    SelectExample,
    SelectModelAndDescription,
    Sentence,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';
import { MultiModelDemo, Predict, Interpreters, Attackers } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Input, Prediction, InterpreterData, isWithTokenizedInput } from './types';

export const Main = () => {
    return (
        <Content>
            <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
                <TaskTitle />
                <TaskDescription />
                <SelectModelAndDescription />
                <Tabs>
                    <Tabs.TabPane tab="Demo" key="Demo">
                        <SelectExample displayProp="sentence" placeholder="Select a Sentence" />
                        <Predict<Input, Prediction>
                            fields={
                                <>
                                    <Sentence />
                                    <Submit>Run Model</Submit>
                                </>
                            }>
                            {({ model, input, output }) => (
                                <Output>
                                    <Predictions model={model} input={input} output={output} />
                                    {isWithTokenizedInput(output) ? (
                                        <Interpreters<Input, InterpreterData>
                                            model={model}
                                            input={input}>
                                            {(interpreterOutput) => (
                                                <Saliency
                                                    interpretData={[
                                                        interpreterOutput.instance_1.grad_input_1,
                                                    ]}
                                                    inputTokens={[output.words]}
                                                    inputHeaders={['Sentence']}
                                                />
                                            )}
                                        </Interpreters>
                                    ) : null}
                                    <Attackers
                                        model={model}
                                        input={input}
                                        prediction={output}
                                        target="sentence"
                                    />
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
