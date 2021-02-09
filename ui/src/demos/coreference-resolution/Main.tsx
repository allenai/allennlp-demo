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
} from '@allenai/tugboat/components';

import { AppId } from '../../AppId';
import { TaskDemo, Predict } from '../../components';
import { config } from './config';
import { Usage } from './Usage';
import { Predictions } from './Predictions';
import { Version, Input, Prediction } from './types';

export const Main = () => {
    return (
        <TaskDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectedModelDescription />
            <Tabs>
                <Tabs.TabPane tab="TaskDemo" key="Demo">
                    <SelectExample displayProp="document" placeholder="Select a Document" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Document />
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
                                            slug={Share.makeSlug(input.document)}
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
                <Tabs.TabPane tab="Model Usage" key="Usage">
                    <Usage />
                </Tabs.TabPane>
            </Tabs>
        </TaskDemo>
    );
};
