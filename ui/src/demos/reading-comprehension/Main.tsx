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
                        {(p: Prediction) => {
                            // TODO: we need access to the input
                            const input = {
                                passage:
                                    "In the first quarter, the Bears drew first blood as kicker Robbie Gould nailed a 22-yard field goal for the only score of the period. In the second quarter, the Bears increased their lead with Gould nailing a 42-yard field goal. They increased their lead with Cutler firing a 7-yard TD pass to tight end Greg Olsen. The Bears then closed out the first half with Gould's 41-yard field goal. In the third quarter, the Vikes started to rally with running back Adrian Peterson's 1-yard touchdown run (with the extra point attempt blocked). The Bears increased their lead over the Vikings with Cutler's 2-yard TD pass to tight end Desmond Clark. The Vikings then closed out the quarter with quarterback Brett Favre firing a 6-yard TD pass to tight end Visanthe Shiancoe. An exciting fourth quarter ensued. The Vikings started out the quarter's scoring with kicker Ryan Longwell's 41-yard field goal, along with Adrian Peterson's second 1-yard TD run. The Bears then responded with Cutler firing a 20-yard TD pass to wide receiver Earl Bennett. The Vikings then completed the remarkable comeback with Favre finding wide receiver Sidney Rice on a 6-yard TD pass on 4th-and-goal with 15 seconds left in regulation. The Bears then took a knee to force overtime. In overtime, the Bears won the toss and marched down the field, stopping at the 35-yard line. However, the potential game-winning 45-yard field goal attempt by Gould went wide right, giving the Vikings a chance to win. After an exchange of punts, the Vikings had the ball at the 26-yard line with 11 minutes left in the period. On the first play of scrimmage, Favre fired a screen pass to Peterson who caught it and went 16 yards, before being confronted by Hunter Hillenmeyer, who caused Peterson to fumble the ball, which was then recovered by Bears' linebacker Nick Roach. The Bears then won on Jay Cutler's game-winning 39-yard TD pass to wide receiver Devin Aromashodu. With the loss, not only did the Vikings fall to 11-4, they also surrendered homefield advantage to the Saints.",
                                question: 'Who threw the longest touchdown pass of the game?',
                            };

                            let answerType = 'oldInterface';
                            if ('answerType' in p) {
                                answerType = (p as any).answerType;
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
                                    const pp = p as BiDAFPrediction;
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

                                            <Answer.Section label="DEBUG JSON">
                                                <PrettyPrintedJSON json={p} />
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
