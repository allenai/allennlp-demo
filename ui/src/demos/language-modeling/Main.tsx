import React from 'react';
import { Tabs } from 'antd';

import {
    ModelCard,
    Output,
    SelectedModelDescription,
    SelectExample,
    Field,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';
import { AppId } from '../../AppId';
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Predictions } from './Predictions';
import { Version, Input, Prediction } from './types';

export const Main = () => {
    return (
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectedModelDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="text" placeholder="Select a Sentence" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Text />
                                {/* TODO: [jon] replace Text with Sentence once backend is fixed */}
                                <Field.Hidden name="sentence" value="This is a test " />
                                <Submit>Run Model</Submit>
                            </>
                        }>
                        {({ input, model, output }) => (
                            <Output>
                                <Output.Section
                                    title="Model Output"
                                    extra={
                                        <Share.ShareButton
                                            doc={input}
                                            slug={Share.makeSlug(input.text)}
                                            type={Version}
                                            app={AppId}
                                        />
                                    }>
                                    <Predictions input={input} model={model} output={output} />
                                </Output.Section>
                            </Output>
                        )}
                    </Predict>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Model Card" key="Card">
                    <ModelCard />
                </Tabs.TabPane>
            </Tabs>
        </MultiModelDemo>
    );
};
