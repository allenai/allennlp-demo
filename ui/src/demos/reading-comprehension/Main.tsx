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
import { Model } from '../../tugboat/lib';
import { MultiModelDemo, Predict } from '../../components';
import { config } from './config';
import { Input, Prediction, BiDAFPrediction, NAQANetAnswerType } from './types';

export const Main = () => {
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
                    <Output<Input, Prediction>>
                        {({ input, output, model }) => {
                            return (
                                <>
                                    <OutputByModel input={input} output={output} model={model} />

                                    {/* Below are displayed for all paths. */}
                                    <Answer.Section label="Model JSON (DEBUG)">
                                        <PrettyPrintedJSON json={model} />
                                    </Answer.Section>

                                    <Answer.Section label="Input JSON (DEBUG)">
                                        <PrettyPrintedJSON json={input} />
                                    </Answer.Section>

                                    <Answer.Section label="Output JSON (DEBUG)">
                                        <PrettyPrintedJSON json={output} />
                                    </Answer.Section>
                                </>
                            );
                        }}
                    </Output>
                </Predict>
            </MultiModelDemo>
        </Content>
    );
};

const OutputByModel = ({
    input,
    output,
    model,
}: {
    input: Input;
    output: Prediction;
    model: Model;
}) => {
    // Determining which output code to display is non trivial
    // the original output interface did not include answerType, so
    // if we will use the older (default) display in the switch below.
    // Now, if the model is NMN, we use yet another output display, so
    // we are setting the answertype to nmn.
    // TODO, should there be a set of const ids somewhere?
    switch (model.id) {
        case 'bidaf':
        case 'bidaf-elmo': {
            // TODO: is bidaf the only model we need here?
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
                </>
            );
        }
        // TODO: I dont see this in the model selection... does it need to be added, or
        // can we remove this case?
        case 'nmn': {
            // TODO: add other types
            return <>has nmn answer</>;
        }
        // default catches the rest of the models that support the newer interface.
        default: {
            if ('answer_type' in (output as any).answer) {
                switch ((output as any).answer.answer_type) {
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
                }
            }
        }
    }
    // If we dont have an output, fall back to no answer.
    return <Answer.NoAnswer />;
};
