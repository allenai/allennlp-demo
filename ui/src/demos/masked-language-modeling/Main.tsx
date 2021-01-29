import React from 'react';
import { Tabs } from 'antd';
import { RuleObject } from 'antd/lib/form';

import {
    ModelCard,
    Output,
    SelectedModelDescription,
    Saliency,
    SelectExample,
    Field,
    Share,
    Submit,
    TaskDescription,
    TaskTitle,
} from '../../tugboat/components';
import { AppId } from '../../AppId';
import { MultiModelDemo, Predict, Interpreters } from '../../components';
import { config } from './config';
import { Predictions } from './Predictions';
import { Version, Input, Prediction, InterpreterData, isWithTokenizedInput } from './types';

export const Main = () => {
    // The hidden fields below are passing parameters to the api that the user does not need to set
    return (
        <MultiModelDemo ids={config.modelIds} taskId={config.taskId}>
            <TaskTitle />
            <TaskDescription />
            <SelectedModelDescription />
            <Tabs>
                <Tabs.TabPane tab="Demo" key="Demo">
                    <SelectExample displayProp="sentence" placeholder="Select a Sentence" />
                    <Predict<Input, Prediction>
                        fields={
                            <>
                                <Field.Sentence validator={validateHasAtLeastOnceMaskToken} />
                                <Field.Hidden name="model_name" value="345M" />
                                <Field.Hidden name="numsteps" value="5" />
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
                                            slug={Share.makeSlug(input.sentence)}
                                            type={Version}
                                            app={AppId}
                                        />
                                    }>
                                    <Predictions input={input} model={model} output={output} />
                                    {isWithTokenizedInput(output) ? (
                                        <Interpreters<Input, InterpreterData> input={input}>
                                            {(interpreterOutput) => (
                                                <Saliency
                                                    interpretData={[
                                                        interpreterOutput.instance_1.grad_input_1,
                                                    ]}
                                                    inputTokens={[output.tokens]}
                                                    inputHeaders={['Sentence']}
                                                />
                                            )}
                                        </Interpreters>
                                    ) : null}
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

const validateHasAtLeastOnceMaskToken = async (_: RuleObject, text: string) => {
    if (!text || text.indexOf('[MASK]') === -1) {
        return Promise.reject(new Error('The sentence must include one or more "[MASK]" tokens.'));
    }
};
