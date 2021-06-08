import React from 'react';
import styled from 'styled-components';
import Table from 'antd/es/table';
import { belowOrEqualTo } from '@allenai/varnish/theme/breakpoints';
import { Output, Spark, SparkEnvelope, SparkValue } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';
import {
    UnexpectedModelError,
    UnexpectedOutputError,
    InvalidModelResponseError,
} from '@allenai/tugboat/error';

import { DebugInfo } from '../../components';
import { Input, Prediction, isElmoPrediction, isRobertaPrediction } from './types';
import { ModelId } from '../../lib';

/**
 * TODO: These are SVGs, so we should just convert them into React.Components that are output
 * as part of the DOM. They'll be faster, look better and we can change colors n' such via
 * CSS.
 */
import TeContainerSrc from '../../icons/te-container.svg';
import TeTriangleSrc from '../../icons/te-graph.svg';
import TePlotSrc from '../../icons/te-plot.svg';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    return (
        <Output.Section>
            <OutputByModel output={output} model={model} />

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const OutputByModel = ({ output, model }: { output: Prediction; model: Model }) => {
    switch (model.id) {
        case ModelId.ELMOSNLI: {
            if (!isElmoPrediction(output)) {
                throw new UnexpectedOutputError(model.id);
            }
            return <BasicPrediction probs={output.label_probs} />;
        }
        case ModelId.RobertaSNLI:
        case ModelId.BinaryGenderBiasMitigatedRobertaSNLI:
        case ModelId.RobertaMNLI: {
            if (!isRobertaPrediction(output)) {
                throw new UnexpectedOutputError(model.id);
            }
            return <BasicPrediction probs={output.probs} />;
        }
    }
    // If we dont have any output throw.
    throw new UnexpectedModelError(model.id);
};

const BasicPrediction = ({ probs }: { probs: number[] }) => {
    const [entailment, contradiction, neutral] = probs;

    const judgments = {
        contradiction: (
            <span>
                the premise <strong>contradicts</strong> the hypothesis
            </span>
        ),
        entailment: (
            <span>
                the premise <strong>entails</strong> the hypothesis
            </span>
        ),
        neutral: (
            <span>
                there is <strong>no correlation</strong> between the premise and hypothesis
            </span>
        ),
    };

    // Find judgment and confidence.
    let judgment;
    let confidence;

    if (entailment > contradiction && entailment > neutral) {
        judgment = judgments.entailment;
        confidence = entailment;
    } else if (contradiction > entailment && contradiction > neutral) {
        judgment = judgments.contradiction;
        confidence = contradiction;
    } else if (neutral > entailment && neutral > contradiction) {
        judgment = judgments.neutral;
        confidence = neutral;
    } else {
        throw new InvalidModelResponseError('Cannot form judgment.');
    }

    // Create summary text.
    const veryConfident = 0.75;
    const somewhatConfident = 0.5;
    let summaryText;

    if (confidence >= veryConfident) {
        summaryText = (
            <div>
                It is <strong>very likely</strong> that {judgment}.
            </div>
        );
    } else if (confidence >= somewhatConfident) {
        summaryText = (
            <div>
                It is <strong>somewhat likely</strong> that {judgment}.
            </div>
        );
    } else {
        summaryText = <div>The model is not confident in its judgment.</div>;
    }

    const dataSource = [
        {
            key: 'entailment',
            judgement: 'Entailment',
            probability: entailment,
        },
        {
            key: 'contradiction',
            judgement: 'Contradiction',
            probability: contradiction,
        },
        {
            key: 'neutral',
            judgement: 'Neutral',
            probability: neutral,
        },
    ];

    const percent = new Intl.NumberFormat(navigator.language, {
        style: 'percent',
        maximumFractionDigits: 1,
    });

    const columns = [
        {
            title: 'Judgement',
            dataIndex: 'judgement',
            key: 'judgement',
        },
        {
            title: 'Probability',
            dataIndex: 'probability',
            key: 'probability',
            render: (val: number) => (
                <div title={val.toString()}>
                    <SparkEnvelope>
                        <Spark value={100 * val} />
                    </SparkEnvelope>{' '}
                    <SparkValue>{percent.format(val)}</SparkValue>
                </div>
            ),
        },
    ];

    return (
        <>
            <Output.SubSection>{summaryText}</Output.SubSection>
            <Output.SubSection>
                <Columns>
                    <TernaryGraph
                        contradiction={contradiction}
                        neutral={neutral}
                        entailment={entailment}
                    />
                    <Table dataSource={dataSource} columns={columns} pagination={false} />
                </Columns>
            </Output.SubSection>
        </>
    );
};

const Columns = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: ${({ theme }) => theme.spacing.xl};

    @media ${({ theme }) => belowOrEqualTo(theme.breakpoints.lg)} {
        grid-template-columns: 1fr;
        grid-gap: ${({ theme }) => theme.spacing.md};
    }
`;

/**
 * TeGraph is a series of layered images that show a point on a triangle depicting a ternary plot.
 */
interface TernaryGraphProps {
    contradiction: number;
    neutral: number;
    entailment: number;
}

const TernaryGraph = ({ contradiction, neutral, entailment }: TernaryGraphProps) => {
    const fixedContainerWidth = 290;
    const fixedContainerHeight = 260;
    const fixedTriangleWidth = 224;
    const fixedTriangleHeight = 194;
    const triangleTopMargin = 10;
    const widthPad = (fixedContainerWidth - fixedTriangleWidth) / 2;
    const heightPad = triangleTopMargin + (fixedContainerHeight - fixedTriangleHeight) / 2;

    // https://en.wikipedia.org/wiki/Ternary_plot#Plotting_a_ternary_plot
    const a = contradiction;
    const b = neutral;
    const c = entailment;
    const x = (0.5 * (2 * b + c)) / (a + b + c);
    const y = c / (a + b + c);
    const absoluteX = Math.round(x * fixedTriangleWidth) + widthPad;
    const absoluteY = Math.round((1.0 - y) * fixedTriangleHeight) + heightPad;

    return (
        <TernaryContainer width={fixedContainerWidth} height={fixedContainerHeight}>
            <TernaryLabels />
            <TernaryTrangle
                width={fixedTriangleWidth}
                height={fixedTriangleHeight}
                left={widthPad}
                top={heightPad}
            />
            <TernaryPlot left={absoluteX} top={absoluteY} />
        </TernaryContainer>
    );
};

const TernaryContainer = styled.div<{ width: number; height: number }>`
    position: relative;
    width: ${({ width }) => `${width}px`};
    min-width: ${({ width }) => `${width}px`};
    height: ${({ height }) => `${height}px`};
    min-height: ${({ height }) => `${height}px`};
`;

const TernaryLabels = styled.img.attrs({ src: TeContainerSrc })`
    position: absolute;
`;

const TernaryTrangle = styled.img.attrs({ src: TeTriangleSrc }) <{
    width: number;
    height: number;
    top: number;
    left: number;
}>`
    position: absolute;
    width: ${({ width }) => `${width}px`};
    height: ${({ height }) => `${height}px`};
    left: ${({ left }) => `${left}px`};
    top: ${({ top }) => `${top}px`};
`;

const TernaryPlot = styled.img.attrs({ src: TePlotSrc }) <{ top: number; left: number }>`
    position: absolute;
    margin: -7px 0 0 -7px;
    width: 14px;
    height: 14px;
    left: ${({ left }) => `${left}px`};
    top: ${({ top }) => `${top}px`};
`;
