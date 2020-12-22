import React from 'react';

import {
    PrettyPrintedJSON,
    TextWithHighlight,
    Answer,
    Output as TBOutput,
} from '../../tugboat/components';
import { Model } from '../../tugboat/lib';
import {
    ModelId,
    SaliencyMaps,
    Interpreter,
    InterpreterData,
    AllInterpreterData,
    GradInputInstance,
} from '../../lib';
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
                return <BiDAFPredictionAnswer input={input} output={output} />;
            }
            break;
        }
        case ModelId.TransformerQa: {
            if (isTransformerQAPrediction(output)) {
                return <TransformerQAPredictionAnswer input={input} output={output} />;
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

const BiDAFPredictionAnswer = ({ input, output }: { input: Input; output: BiDAFPrediction }) => {
    let best_span = output.best_span;
    if (best_span[0] >= best_span[1]) {
        // TODO: there is a bug in the response, so we need to calculate the best_span locally
        const start = input.passage.indexOf(output.best_span_str);
        best_span = [start, start + output.best_span_str.length];
    }

    // todo: we need to get these from the output
    const interpretData: InterpreterData = {} as InterpreterData;
    const interpretModel = Function;

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

            {interpretData ? (
                <MySaliencyMaps
                    interpretData={interpretData}
                    questionTokens={output.question_tokens}
                    passageTokens={output.passage_tokens}
                    interpretModel={interpretModel}
                    requestData={input}
                />
            ) : null}

            <Answer.Section label="Model Attacks">
                <div>TODO</div>
            </Answer.Section>
        </>
    );
};

const TransformerQAPredictionAnswer = ({
    input,
    output,
}: {
    input: Input;
    output: TransformerQAPrediction;
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

const getGradData = ({
    grad_input_1: gradInput1,
    grad_input_2: gradInput2,
}: GradInputInstance): [number[], number[]] => {
    // Not sure why, but it appears that the order of the gradients is reversed for these.
    return [gradInput2, gradInput1];
};

const MySaliencyMaps = ({
    interpretData,
    questionTokens,
    passageTokens,
    interpretModel,
    requestData,
}: {
    interpretData: InterpreterData;
    questionTokens: string[];
    passageTokens: string[];
    interpretModel: Function; // TODO, what type is this
    requestData: Input;
}) => {
    const simpleGradData: [number[], number[]] | undefined =
        Interpreter.GRAD_INTERPRETER in interpretData
            ? getGradData(interpretData[Interpreter.GRAD_INTERPRETER].instance_1)
            : undefined;
    const integratedGradData: [number[], number[]] | undefined =
        Interpreter.IG_INTERPRETER in interpretData
            ? getGradData(interpretData[Interpreter.IG_INTERPRETER].instance_1)
            : undefined;
    const smoothGradData: [number[], number[]] | undefined =
        Interpreter.SG_INTERPRETER in interpretData
            ? getGradData(interpretData[Interpreter.SG_INTERPRETER].instance_1)
            : undefined;
    const inputTokens: [string[], string[]] = [questionTokens, passageTokens];
    const inputHeaders = [<h5>Question:</h5>, <h5>Passage:</h5>];
    const allInterpretData: AllInterpreterData = {
        simple: simpleGradData,
        ig: integratedGradData,
        sg: smoothGradData,
    };
    return (
        <SaliencyMaps
            interpretData={allInterpretData}
            inputTokens={inputTokens}
            inputHeaders={inputHeaders}
            interpretModel={interpretModel}
            requestData={requestData}
        />
    );
};
