import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';
import { Content } from '@allenai/varnish/components';

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
import { isWithTokenizedInput } from '../../lib';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Version, Input, Prediction, getBasicAnswer, InterpreterData } from './types';

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
                                    <Output.Section
                                        title="Model Output"
                                        extra={
                                            <AlignRight>
                                                <Share.Link
                                                    doc={input}
                                                    slug={Share.makeSlug(input.question)}
                                                    type={Version}
                                                    app={AppId}
                                                />
                                            </AlignRight>
                                        }>
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
