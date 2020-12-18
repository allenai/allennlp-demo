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
    Field,
} from '../../tugboat/components';

import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Input, Prediction, BiDAFPrediction, NAQANetAnswerType } from './types';

// TODO: Description should come from TaskCard?
// TODO: Just pass config?
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
                    {(p: Prediction) => {
                        // TODO: we need access to the input
                        const input = {
                            passage:
                                'A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight.',
                            question: 'How many partially reusable launch systems were developed?',
                        };

                        let answerType;
                        if ('answerType' in p) {
                            answerType = (p as any).answerType;
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
                            default: {
                                // default is a BiDAFPrediction prediction
                                const pp = p as BiDAFPrediction;
                                // TODO: there is a bug in the response, so we need to calculate the best_span locally
                                const start = input.passage.indexOf(pp.best_span_str);
                                const best_span = [start, start + pp.best_span_str.length];
                                // TODO: make shared components for labels?
                                return (
                                    <>

                                        <Field>Answer</Field>
                                        <div>{pp.best_span_str}</div>
                                        <div>Passage Context</div>
                                        <div>
                                            <TextWithHighlight
                                                text={input.passage}
                                                highlightRanges={[
                                                    {
                                                        start: best_span[0],
                                                        end: best_span[1],
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div>Question Model Interpretations</div>
                                        <div>Model Attacks</div>
                                        <div>DEBUG JSON</div>
                                        <div>
                                            <PrettyPrintedJSON json={p} />
                                        </div>
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
