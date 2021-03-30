import React from 'react';
import Tabs from 'antd/es/tabs';
import {
    SelectedModelCard,
    Output,
    Field,
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
import { Input, Prediction, getBasicAnswer, isWithTokenizedInput, Version } from './types';
import { InterpreterData, DoubleGradInput, isDoubleInterpreterData } from '../../lib';

export const Main = () => {
    return (
        <TaskDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectModelAndDescription />
            <Tabs>
                <Tabs.TabPane tab="TaskDemo" key="Demo">
                    <SelectExample displayProp="question" placeholder="Select a Question…" />
                    <Predict<Input, Prediction>
                        version={Version}
                        fields={
                            <>
                                <Field.Passage />
                                <Field.Question />
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
                                            slug={Share.makeSlug(input.question)}
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
                                                    <Saliency
                                                        interpretData={[
                                                            interpreterOutput.instance_1
                                                                .grad_input_2,
                                                            interpreterOutput.instance_1
                                                                .grad_input_1,
                                                        ]}
                                                        inputTokens={[
                                                            output.question_tokens,
                                                            output.passage_tokens,
                                                        ]}
                                                        inputHeaders={['Question', 'Passage']}
                                                    />
                                                ) : undefined
                                            }
                                        </Interpreters>
                                    ) : null}
                                    <Attackers
                                        input={input}
                                        model={model}
                                        prediction={output}
                                        target="question">
                                        {(pred) => getBasicAnswer(pred)}
                                    </Attackers>
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
