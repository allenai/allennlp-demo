import React from 'react';

import {
    PrettyPrintedJSON,
    TextWithHighlight,
    Answer,
    Output as TBOutput,
} from '../../tugboat/components';
import { Model } from '../../tugboat/lib';
import { ModelId } from '../../lib';
import { UnexpectedModel } from '../../tugboat/error';
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

export const Output = (props: any) => (
    <TBOutput<Input, Prediction> {...props}>
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
    </TBOutput>
);

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
    throw new UnexpectedModel(model.id);
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
