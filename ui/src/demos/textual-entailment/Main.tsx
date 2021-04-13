import React from 'react';
import Tabs from 'antd/es/tabs';
import {
    Field,
    SelectedModelCard,
    Output,
    Saliency,
    SelectExample,
    SelectModelAndDescription,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '@allenai/tugboat/components';

import { AppId } from '../../AppId';
import { TaskDemo, Predict, Interpreters, Attackers } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Version, Input, Prediction, isWithTokenizedInput } from './types';
import { InterpreterData, DoubleGradInput, isDoubleInterpreterData } from '../../lib';

export const Main = () => {
    return (
        <TaskDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectModelAndDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="premise" placeholder="Select a Premise" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Premise />
                                <Field.Hypothesis />
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
                                            slug={Share.makeSlug(input.premise)}
                                            type={Version}
                                            app={AppId}
                                        />
                                    }>
                                    <Predictions input={input} model={model} output={output} />
                                    {isWithTokenizedInput(output) ? (
                                        <Interpreters<Input, InterpreterData<DoubleGradInput>>
                                            input={input}>
                                            {(interpreterOutput) =>
                                                isDoubleInterpreterData(interpreterOutput) ? (
                                                    <>
                                                        <Saliency
                                                            interpretData={[
                                                                interpreterOutput.instance_1
                                                                    .grad_input_2,
                                                            ]}
                                                            inputTokens={[output.tokens]}
                                                            inputHeaders={['Premise']}
                                                        />
                                                        <Saliency
                                                            interpretData={[
                                                                interpreterOutput.instance_1
                                                                    .grad_input_1,
                                                            ]}
                                                            inputTokens={[output.tokens]}
                                                            inputHeaders={['Hypothesis']}
                                                        />
                                                    </>
                                                ) : undefined
                                            }
                                        </Interpreters>
                                    ) : null}
                                    <Attackers
                                        input={input}
                                        model={model}
                                        prediction={output}
                                        target="hypothesis"
                                    />
                                </Output.Section>
                            </Output>
                        )}
                    </Predict>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Model Card" key="Card">
                    <SelectedModelCard />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Model Usage" key="Usage">
                    <Usage />
                </Tabs.TabPane>
            </Tabs>
        </TaskDemo>
    );
};
