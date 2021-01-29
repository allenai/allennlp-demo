import React from 'react';
import { Tabs } from 'antd';

import {
    ModelCard,
    Output,
    SelectedModelDescription,
    Saliency,
    SelectExample,
    Field,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';
import { AppId } from '../../AppId';
import { MultiModelDemo, Predict, Interpreters, Attackers } from '../../components';
import { config } from './config';
import { Predictions } from './Predictions';
import { Version, Input, Prediction, InterpreterData } from './types';

export const Main = () => {
    // The hidden fields below are passing parameters to the api that the user does not need to set
    return (
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectedModelDescription />
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
                                                inputTokens={[output.tokens]}
                                                inputHeaders={['Sentence']}
                                            />
                                        )}
                                    </Interpreters>
                                    {/* TODO: [jon] this needs to be "grad_input_1" here */}
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
            </Tabs>
        </MultiModelDemo>
    );
};
