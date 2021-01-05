import React from 'react';
import { Collapse } from 'antd';

import {
    PrettyPrintedJSON,
    TextWithHighlight,
    Output,
    ArithmeticEquation,
    ModelSuccess,
} from '../../tugboat/components';
import { Model } from '../../tugboat/lib';
import { ModelId } from '../../lib';
import { UnexpectedModelError } from '../../tugboat/error';
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
    isNMNPrediction,
} from './types';

export const Predictions = ({ input, output, model }: ModelSuccess<Input, Prediction>) => (
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
                return <BasicPrediction input={input} output={output} />;
            }
            break;
        }
        case ModelId.Naqanet: {
            if (isNAQANetPrediction(output)) {
                return <NaqanetPrediction input={input} output={output} />;
            }
            break;
        }
        case ModelId.Nmn: {
            if (isNMNPrediction(output)) {
                return <NmnPrediction />;
            }
            break;
        }
    }
    // If we dont have an output throw.
    throw new UnexpectedModelError(model.id);
};

const BasicPrediction = ({
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

const NaqanetPrediction = ({ input, output }: { input: Input; output: NAQANetPrediction }) => {
    switch (output.answer.answer_type) {
        case NAQANetAnswerType.PassageSpan: {
            return (
                <>
                    <Output.SubSection title="Answer">
                        <div>{output.answer.value}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Explanation">
                        The model decided the answer was in the passage.
                    </Output.SubSection>

                    <Output.SubSection title="Passage Context">
                        {output.answer.spans ? (
                            <TextWithHighlight
                                text={input.passage}
                                highlights={output.answer.spans.map((s) => {
                                    return {
                                        start: s[0],
                                        end: s[1],
                                    };
                                })}
                            />
                        ) : (
                            <div>{input.passage}</div>
                        )}
                    </Output.SubSection>

                    <Output.SubSection title="Question">
                        <div>{input.question}</div>
                    </Output.SubSection>
                </>
            );
        }
        case NAQANetAnswerType.QuestionSpan: {
            return (
                <>
                    <Output.SubSection title="Answer">
                        <div>{output.answer.value}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Explanation">
                        The model decided the answer was in the question.
                    </Output.SubSection>

                    <Output.SubSection title="Passage Context">
                        <div>{input.passage}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Question">
                        {output.answer.spans ? (
                            <TextWithHighlight
                                text={input.question}
                                highlights={output.answer.spans.map((s) => {
                                    return {
                                        start: s[0],
                                        end: s[1],
                                    };
                                })}
                            />
                        ) : (
                            <div>{input.question}</div>
                        )}
                    </Output.SubSection>
                </>
            );
        }
        case NAQANetAnswerType.Count: {
            return (
                <>
                    <Output.SubSection title="Answer">
                        <div>{output.answer.count}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Explanation">
                        The model decided this was a counting problem.
                    </Output.SubSection>

                    <Output.SubSection title="Passage Context">
                        <div>{input.passage}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Question">
                        <div>{input.question}</div>
                    </Output.SubSection>
                </>
            );
        }
        case NAQANetAnswerType.Arithmetic: {
            return (
                <>
                    <Output.SubSection title="Answer">
                        <div>{output.answer.value}</div>
                    </Output.SubSection>

                    <Output.SubSection title="Explanation">
                        {output.answer.numbers ? (
                            <div>
                                The model used the arithmetic expression{' '}
                                <ArithmeticEquation numbersWithSign={output.answer.numbers} /> ={' '}
                                {output.answer.value}.
                            </div>
                        ) : (
                            <div>The model decided this was an arithmetic problem.</div>
                        )}
                    </Output.SubSection>

                    <Output.SubSection title="Passage Context">
                        {output.answer.numbers ? (
                            <TextWithHighlight
                                text={input.passage}
                                highlights={output.answer.numbers
                                    .filter((n) => n.sign !== 0)
                                    .map((n) => {
                                        return {
                                            start: n.span[0],
                                            end: n.span[1],
                                            color: n.sign > 0 ? 'G6' : 'R6',
                                        };
                                    })}
                            />
                        ) : (
                            <div>{input.passage}</div>
                        )}
                    </Output.SubSection>

                    <Output.SubSection title="Question">
                        <div>{input.question}</div>
                    </Output.SubSection>
                </>
            );
        }
    }
};

// TODO
const NmnPrediction = () => {
    return <>has nmn answer</>;
};
