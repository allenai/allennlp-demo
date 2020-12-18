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
import {
    Input,
    Prediction,
    NAQANetAnswerType,
    BiDAFPrediction,
    NAQANetPrediction,
    TransformerQAPrediction,
    isBiDAFPrediction,
    isNAQANetPrediction,
    isTransformerQAPrediction,
} from './types';

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
            if (isBiDAFPrediction(output)) {
                return <BasicAnswer input={input} output={output} />;
            }
            break;
        }
        case ModelId.TransformerQa: {
            if (isTransformerQAPrediction(output)) {
                return <BasicAnswer input={input} output={output} />;
            }
            break;
        }
        // TODO: I dont see this in the model selection... does it need to be added, or can we remove this case?
        case ModelId.Nmn: {
            if (isNAQANetPrediction(output)) {
                return <NmnAnswer />;
            }
            break;
        }
        case ModelId.Naqanet: {
            if (isNAQANetPrediction(output)) {
                return <NaqanetAnswer output={output} />;
            }
            break;
        }
    }
    // If we dont have an output throw.
    throw new InvalidModelForTaskError(model.id);
};

const BasicAnswer = ({
    input,
    output,
}: {
    input: Input;
    output: BiDAFPrediction | TransformerQAPrediction;
}) => {
    let best_span = output.best_span;
    if (best_span[0] >= best_span[1]) {
        // TODO: there is a bug in the response, so we need to calculate the best_span locally
        const start = input.passage.indexOf(output.best_span_str);
        best_span = [start, start + output.best_span_str.length];
    }
    return (
        <>
            <Answer.Section label="Answer">
                <div>{output.best_span_str}</div>
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
};

// TODO
const NmnAnswer = () => {
    return <>has nmn answer</>;
};

// TODO:
const NaqanetAnswer = ({ output }: { output: NAQANetPrediction }) => {
    switch (output.answer['answer-type']) {
        case NAQANetAnswerType.PassageSpan: {
            return <>has PassageSpan answer</>;
        }
        case NAQANetAnswerType.QuestionSpan: {
            return <>has QuestionSpan answer</>;
        }
        case NAQANetAnswerType.Count: {
            return <>has Count answer</>;
        }
        case NAQANetAnswerType.Arithmetic: {
            return <>has Arithmetic answer</>;
        }
    }
};
