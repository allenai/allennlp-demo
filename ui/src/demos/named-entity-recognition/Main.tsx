import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';
import { Content } from '@allenai/varnish/components';

import {
    ModelCard,
    Output,
    Saliency,
    SelectExample,
    SelectModelAndDescription,
    Sentence,
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
import { Version, Input, Prediction, InterpreterData, isWithTokenizedInput } from './types';

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
                            {({ input, model, output }) => (
                                <Output>
                                    <Output.Section
                                        title="Model Output"
                                        extra={
                                            <AlignRight>
                                                <Share.Link
                                                    doc={input}
                                                    slug={Share.makeSlug(input.sentence)}
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
                                                                .grad_input_1,
                                                        ]}
                                                        inputTokens={[output.words]}
                                                        inputHeaders={['Sentence']}
                                                    />
                                                )}
                                            </Interpreters>
                                        ) : null}
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
            </MultiModelDemo>
        </Content>
    );
};

const AlignRight = styled.span`
    // TODO: [jon] make reusable
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;
