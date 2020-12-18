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
    Question,
    Passage,
    Submit,
} from '../../tugboat/components';
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Output } from './Output';
import { Input, Prediction } from './types';

export const Main = () => {
    return (
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
                    <Output />
                </Predict>
            </MultiModelDemo>
        </Content>
    );
};
