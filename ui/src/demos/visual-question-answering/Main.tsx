/**
 * NOTE: VQA is a complex task and is a bad example to fork from unless you need an Image input
 * control.
 */

import React, { useState, useContext } from 'react';
import { Tabs } from 'antd';

import {
    Field,
    Fields,
    ModelCard,
    Output,
    SelectedModelDescription,
    SelectExample,
    Submit,
    TaskDescription,
    TaskTitle,
    UploadedImage,
} from '../../tugboat/components';
import { Examples } from '../../tugboat/context';
import { Demo, Predict } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Input, Prediction } from './types';

import baseballSrc from '../exampleImages/baseball_game.jpg';
import busStopSrc from '../exampleImages/bus_stop.jpg';
import kitchenSrc from '../exampleImages/kitchen.jpg';
import livingRoomSrc from '../exampleImages/living_room.jpg';

interface UploadImageProps {
    onChange: (i: UploadedImage) => void;
}

// We wrap the Image field in order to gain access to the example context.
const UploadImage = ({ onChange }: UploadImageProps) => {
    const examples = useContext(Examples);
    return <Field.Image value={examples.selectedExample?.image} onChange={onChange} />;
};

export const Main = () => {
    // Fields on the form to force an update to the value, this is needed because the input control
    // does not know about the form, and the form is not available at field construction time.
    const [overrides, setOverrides] = useState<Fields>();

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
        <Demo ids={config.modelIds} taskId={config.taskId} examples={examples}>
            <TaskTitle />
            <TaskDescription />
            <SelectedModelDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="snippet" placeholder="Select an Example" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <UploadImage onChange={(image) => setOverrides({ image })} />
                                <Field.Question />
                                <Submit>Run Model</Submit>
                            </>
                        }
                        overrides={overrides}>
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
        </Demo>
    );
};
