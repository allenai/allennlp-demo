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
    TextWithHighlight,
    Answer,
} from '../../tugboat/components';
import { Models } from '../../tugboat/context';
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Input, Prediction, BiDAFPrediction, NAQANetAnswerType } from './types';

export const Main = () => {
    const modelCtx = React.useContext(Models); // TODO, replace when sams code drops
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
                    <Output>
                        {({ output, input }: { output: Prediction; input: Input }) => {
                            let answerType = 'oldInterface';
                            if ('answerType' in output) {
                                answerType = (output as any).answerType;
                            }
                            // TODO: we need model as part of input, hacking it in here
                            if (modelCtx.selectedModel?.id === 'nmn') {
                                // TODO, should there be a set of const ids somewhere?
                                answerType = 'nmn';
                            }

                            switch (answerType) {
                                case NAQANetAnswerType.PassageSpan: {
                                    // TODO: add other types
                                    return <>has PassageSpan answer</>;
                                }
                                case NAQANetAnswerType.QuestionSpan: {
                                    // TODO: add other types
                                    return <>has QuestionSpan answer</>;
                                }
                                case NAQANetAnswerType.Count: {
                                    // TODO: add other types
                                    return <>has Count answer</>;
                                }
                                case NAQANetAnswerType.Arithmetic: {
                                    // TODO: add other types
                                    return <>has Arithmetic answer</>;
                                }
                                case 'nmn': {
                                    // TODO: add other types
                                    return <>has nmn answer</>;
                                }
                                default: {
                                    // oldInterface falls to here
                                    // default is a BiDAFPrediction prediction
                                    const pp = output as BiDAFPrediction;
                                    // TODO: there is a bug in the response, so we need to calculate the best_span locally
                                    const start = input.passage.indexOf(pp.best_span_str);
                                    const best_span = [start, start + pp.best_span_str.length];
                                    return (
                                        <>
                                            <Answer.Section label="Answer">
                                                <div>{pp.best_span_str}</div>
                                            </Answer.Section>

                                            <Answer.Section label="Passage Context">
                                                <TextWithHighlight
                                                    text={input.passage}
                                                    highlightRanges={[
                                                        {
                                                            start: best_span[0],
                                                            end: best_span[1],
                                                        },
                                                    ]}
                                                />
                                            </Answer.Section>

                                            <Answer.Section label="Question">
                                                <div>{input.question}</div>
                                            </Answer.Section>

                                            <Answer.Section label="Model Interpretations">
                                                <div>TODO</div>
                                            </Answer.Section>

                                            <Answer.Section label="Model Attacks">
                                                <div>TODO</div>
                                            </Answer.Section>

                                            <Answer.Section label="Output JSON (DEBUG)">
                                                <PrettyPrintedJSON json={output} />
                                            </Answer.Section>

                                            <Answer.Section label="Input JSON (DEBUG)">
                                                <PrettyPrintedJSON json={input} />
                                            </Answer.Section>
                                        </>
                                    );
                                }
                            }
                        }}
                    </Output>
                </Predict>
            </MultiModelDemo>
        </Content>
    );
};
