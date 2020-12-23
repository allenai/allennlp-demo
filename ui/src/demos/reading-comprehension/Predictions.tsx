import React from 'react';
import { Collapse } from 'antd';

import { PrettyPrintedJSON, TextWithHighlight, Output, Result } from '../../tugboat/components';
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

export const Predictions = ({ input, output, model }: Result<Input, Prediction>) => (
    <Output.Section title="Model Output">
        <OutputByModel input={input} output={output} model={model} />

        <Output.SubSection title="Debug Output">
            <Collapse>
                <Collapse.Panel key="model-debug" header="Model">
                    <PrettyPrintedJSON json={model} />
                </Collapse.Panel>
                <Collapse.Panel key="input-debug" header="Input">
                    <PrettyPrintedJSON json={input} />
                </Collapse.Panel>
                <Collapse.Panel key="output-debug" header="Output">
                    <PrettyPrintedJSON json={output} />
                </Collapse.Panel>
            </Collapse>
        </Output.SubSection>
    </Output.Section>
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
        case ModelId.BidafElmo:
        case ModelId.TransformerQa: {
            if (isBiDAFPrediction(output) || isTransformerQAPrediction(output)) {
                return <BasicPredictionAnswer input={input} output={output} />;
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

const BasicPredictionAnswer = ({
    input,
    output,
}: {
    input: Input;
    output: TransformerQAPrediction | BiDAFPrediction;
}) => {
    let best_span = output.best_span;
    if (best_span[0] >= best_span[1]) {
        // TODO: there is a bug in the response, so we need to calculate the best_span locally
        const start = input.passage.indexOf(output.best_span_str);
        best_span = [start, start + output.best_span_str.length];
    }
    return (
        <>
            <Output.SubSection title="Answer">
                <div>{output.best_span_str}</div>
            </Output.SubSection>

            <Output.SubSection title="Passage Context">
                <TextWithHighlight
                    text={input.passage}
                    highlights={[
                        {
                            start: best_span[0],
                            end: best_span[1],
                        },
                    ]}
                />
            </Output.SubSection>

            <Output.SubSection title="Question">
                <div>{input.question}</div>
            </Output.SubSection>
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
