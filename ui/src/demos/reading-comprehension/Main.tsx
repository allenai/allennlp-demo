import React from 'react';
import { Content } from '@allenai/varnish/components';

import {
    form,
    Title,
    Description,
    ModelUsageModal,
    ModelCardModal,
    SelectModel,
    Predict,
    PredictInput,
    PredictOutput,
    Question,
    Passage,
} from '../../tugboat/components';

import { MultiModelDemo } from '../../components';
import { config } from './config';
import { Input, Output } from './types';

// TODO: Should we make this a property of the config?
const modelIds = ['bidaf-elmo', 'bidaf', 'nmn', 'transformer-qa', 'naqanet'];

export const Main = () => (
    <Content>
        <MultiModelDemo ids={modelIds}>
            <Title>{config.title}</Title>
            <Description>
                Reading comprehension is the task of answering questions about a passage of text to
                show that the system understands the passage.
            </Description>
            <SelectModel />
            <ModelCardModal />
            <ModelUsageModal />
            {/* TODO: More cleanup here. Better names. */}
            <Predict<Input, Output> action={(modelId) => `/api/${modelId}/predict`}>
                <PredictInput>
                    <Passage />
                    <Question />
                    <form.Submit>Run Model</form.Submit>
                </PredictInput>
                <PredictOutput>
                    {(output: Output) => <pre>{JSON.stringify(output, null, 2)}</pre>}
                </PredictOutput>
            </Predict>
        </MultiModelDemo>
    </Content>
);
