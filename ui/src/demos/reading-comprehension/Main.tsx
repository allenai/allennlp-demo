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
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Interpreters } from './Interpreters';
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
                                        <Output.Section title="Model Predictions">
                                            <Predictions
                                                model={model}
                                                input={input}
                                                output={output}
                                            />
                                        </Output.Section>
                                        <Output.Section
                                            title="Model Interpretations"
                                            helpLabel="What is this?"
                                            helpContent={
                                                <div>
                                                    <p>
                                                        Despite constant advances and seemingly
                                                        super-human performance on constrained
                                                        domains, state-of-the-art models for NLP are
                                                        imperfect. These imperfections, coupled with
                                                        today's advances being driven by (seemingly
                                                        black-box) neural models, leave researchers
                                                        and practitioners scratching their heads
                                                        asking,{' '}
                                                        <i>
                                                            why did my model make this prediction?
                                                        </i>
                                                    </p>
                                                    <a
                                                        href="https://allennlp.org/interpret"
                                                        target="_blank"
                                                        rel="noopener noreferrer">
                                                        Learn More
                                                    </a>
                                                </div>
                                            }>
                                            <Interpreters
                                                model={model}
                                                input={input}
                                                prediction={output}
                                            />
                                        </Output.Section>
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
