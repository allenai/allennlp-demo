import React from 'react';
import { Content } from '@allenai/varnish/components';

import {
    TaskTitle,
    TaskDescription,
    ModelUsageModal,
    ModelCardModal,
    SelectModel,
    SelectExample,
    Fields,
    Output,
    Question,
    Passage,
    PrettyPrintedJSON,
    Submit,
} from '../../tugboat/components';

import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Input, Prediction } from './types';

export const Main = () => (
    <Content>
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectModel />
            <ModelCardModal />
            <ModelUsageModal />
            <SelectExample displayProp="question" placeholder="Select a Question…" />
            <Predict<Input, Prediction>>
                <Fields>
                    <Passage />
                    <Question />
                    <Submit>Run Model</Submit>
                </Fields>
                <Output>
                    {(p: Prediction, i: Input) => (
                        <>
                            <h4>Input:</h4>
                            <PrettyPrintedJSON json={i} />
                            <h4>Output:</h4>
                            <PrettyPrintedJSON json={p} />
                        </>
                    )}
                </Output>
            </Predict>
        </MultiModelDemo>
    </Content>
);
