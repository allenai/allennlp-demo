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
import { ModelId } from '../../lib';
import { InvalidModelForTaskError } from '../../tugboat/error';
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
    switch (model.id) {
        case ModelId.Bidaf:
        case ModelId.BidafElmo: {
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
                            highlights={[
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
        case ModelId.Nmn: {
            // TODO: add other types
            return <>has nmn answer</>;
        }
        case ModelId.Naqanet:
        case ModelId.TransformerQa:
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
    // If we dont have an output throw.
    throw new InvalidModelForTaskError(model.id);
};
