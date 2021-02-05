import React from 'react';
import { Tabs } from 'antd';

import {
    ModelCard,
    Output,
    Saliency,
    SelectExample,
    SelectModelAndDescription,
    Field,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';
import { AppId } from '../../AppId';
import { Demo, Predict, Interpreters, Attackers } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Version, Input, Prediction, InterpreterData } from './types';

export const Main = () => {
    return (
        <Demo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectModelAndDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="sentence" placeholder="Select a Sentence" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Sentence />
                                <Submit>Run Model</Submit>
                            </>
                        }>
                        {({ input, model, output }) => (
                            <Output>
                                <Output.Section
                                    title="Model Output"
                                    extra={
                                        <Share.ShareButton
                                            doc={input}
                                            slug={Share.makeSlug(input.sentence)}
                                            type={Version}
                                            app={AppId}
                                        />
                                    }>
                                    <Predictions input={input} model={model} output={output} />
                                    <Interpreters<Input, InterpreterData> input={input}>
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
                                    <Attackers
                                        input={input}
                                        model={model}
                                        prediction={output}
                                        target="sentence"
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
        </Demo>
    );
};
