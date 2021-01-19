import React from 'react';
import { Tabs } from 'antd';

import {
    ModelCard,
    Output,
    Passage,
    Question,
    Saliency,
    SelectExample,
    SelectModelAndDescription,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';

import { AppId } from '../../AppId';
import { MultiModelDemo, Predict, Interpreters, Attackers } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import {
    Input,
    Prediction,
    getBasicAnswer,
    InterpreterData,
    isWithTokenizedInput,
    Version,
} from './types';

export const Main = () => {
    return (
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectModelAndDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="question" placeholder="Select a Question…" />
                    <Predict<Input, Prediction>
                        version={Version}
                        fields={
                            <>
                                <Passage />
                                <Question />
                                <Submit>Run Model</Submit>
                            </>
                        }>
                        {({ input, model, output }) => (
                            <Output>
                                <Output.ShareableSection
                                    title="Model Output"
                                    doc={input}
                                    slug={Share.makeSlug(input.question)}
                                    type={Version}
                                    app={AppId}>
                                    <Predictions input={input} model={model} output={output} />
                                    {isWithTokenizedInput(output) ? (
                                        <Interpreters<Input, InterpreterData> input={input}>
                                            {(interpreterOutput) => (
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
                                            )}
                                        </Interpreters>
                                    ) : null}
                                    <Attackers
                                        input={input}
                                        model={model}
                                        prediction={output}
                                        target="question">
                                        {(pred) => getBasicAnswer(pred)}
                                    </Attackers>
                                </Output.ShareableSection>
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
    );
};
