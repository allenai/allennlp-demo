import React from 'react';
import { Content } from '@allenai/varnish/components';

import {
    Title,
    Description,
    ModelUsageModal,
    ModelCardModal,
    SelectModel,
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
        <MultiModelDemo ids={config.modelIds}>
            <Title>{config.title}</Title>
            {/* TODO: It might be nice to put the description in the config too, or put it in
                a markdown file that we load and display to facilitate easily tweaking the content.
             */}
            <Description>
                Reading comprehension is the task of answering questions about a passage of text to
                show that the system understands the passage.
            </Description>
            <SelectModel />
            <ModelCardModal />
            <ModelUsageModal />
            <Predict<Input, Prediction>>
                <Fields>
                    <Passage />
                    <Question />
                    <Submit>Run Model</Submit>
                </Fields>
                <Output>{(p: Prediction) => <PrettyPrintedJSON json={p} />}</Output>
            </Predict>
        </MultiModelDemo>
    </Content>
);
