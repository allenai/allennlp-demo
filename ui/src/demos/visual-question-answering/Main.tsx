/**
 * NOTE: VQA is a complex task and is a bad example to fork from unless you need an Image input
 * control.
 */

import React, { useState } from 'react';
import { Tabs } from 'antd';

import {
    Field,
    ModelCard,
    Output,
    SelectExample,
    Submit,
    TaskDescription,
    TaskTitle,
    FormFieldDict,
} from '../../tugboat/components';
import { Example } from '../../tugboat/lib';
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Input, Prediction } from './types';

import baseballSrc from '../exampleImages/baseball_game.jpg';
import busStopSrc from '../exampleImages/bus_stop.jpg';
import kitchenSrc from '../exampleImages/kitchen.jpg';
import livingRoomSrc from '../exampleImages/living_room.jpg';

export const Main = () => {
    // Fields on the for to force an update to the value, this is needed because the input control
    // does not know about the form, and the form is not available at field construction time.
    const [fieldChanges, setFieldChanges] = useState<FormFieldDict>();
    // Holding on to selected example because the fields need to know about changes and the Example
    // context is not ready at form construction time.
    const [selectedExample, setSelectedExample] = useState<Example>();

    // Need to override examples so we have access to the images.
    // TODO: get the backend to supply the images in examples and update ui to be able to point to a
    // file url.
    const examples = [
        {
            snippet: 'Baseball Game: "What game are they playing?"',
            image: baseballSrc,
            question: 'What game are they playing?',
        },
        {
            snippet: 'Bus Stop: "What are the people waiting for?"',
            image: busStopSrc,
            question: 'What are the people waiting for?',
        },
        {
            snippet: 'Kitchen: "What is in the bowls on the island?"',
            image: kitchenSrc,
            question: 'What is in the bowls on the island?',
        },
        {
            snippet: 'Living Room: "What color is the pillow in the middle?"',
            image: livingRoomSrc,
            question: 'What color is the pillow in the middle?',
        },
    ];

    return (
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample
                        displayProp="snippet"
                        placeholder="Select an Example"
                        overrides={examples}
                        onChange={(ex?: Example) => setSelectedExample(ex)}
                    />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Image
                                    value={selectedExample?.image}
                                    onChange={(v) => setFieldChanges(v)}
                                />
                                <Field.Question />
                                <Submit>Run Model</Submit>
                            </>
                        }
                        fieldChanges={fieldChanges}>
                        {({ input, model, output }) => (
                            <Output>
                                <Output.Section title="Model Output">
                                    <Predictions input={input} model={model} output={output} />
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
    );
};
