/* eslint-disable jsx-a11y/anchor-is-valid,jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
import React, { useContext } from 'react';
import { Output, Spark, SparkEnvelope, SparkValue } from '@allenai/tugboat/components';
import { Form } from '@allenai/tugboat/context';
import { Model } from '@allenai/tugboat/lib';
import Table from 'antd/es/table';

import { DebugInfo } from '../../components';
import { Input, Prediction } from './types';

class NoParentFormError extends Error {
    constructor() {
        super('The <SingleResult /> must be a child of a <Form />.');
    }
}

function cleanTopTokensForDisplay(tokens: string[]): string {
    // get rid of CRs
    const cleanWord = tokens
        .join('')
        .replace(' ,', ',')
        .replace(/\n+/g, '↵')
        .replace(/Ġ+/g, ' ')
        .replace(/Ċ+/g, '↵');

    return cleanWord.trim();
}

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

interface SingleResultProps {
    input: Input;
    pred: string[];
}
const SingleResult = ({ pred, input }: SingleResultProps) => {
    const form = useContext(Form);
    const completion = cleanTopTokensForDisplay(pred);
    const displayCompletion =
        completion.endsWith('.') || completion.endsWith('↵') ? completion : completion.concat(' …');
    const displayInput = input.sentence.trim();
    return (
        <span>
            {displayInput}{' '}
            <a
                onClick={() => {
                    if (!form) {
                        throw new NoParentFormError();
                    }
                    form.setFieldsValue({
                        sentence: `${displayInput} ${completion}`,
                    });
                    form.submit();
                }}>
                <strong>{displayCompletion}</strong>
            </a>
        </span>
    );
};

export const Predictions = ({ input, model, output }: Props) => {
    const formatProbability = (probs: number[], idx: number) => {
        // normalize the displayed probabilities
        const sum = probs.reduce(function (a, b) {
            return a + b;
        }, 0);
        const prob = probs[idx] / sum;
        return prob;
    };

    const data = output.top_tokens.map((ti, i) => {
        return {
            key: i,
            probability: formatProbability(output.probabilities, i),
            result: <SingleResult pred={ti} input={input} />,
        };
    });

    const percent = new Intl.NumberFormat(navigator.language, {
        style: 'percent',
        maximumFractionDigits: 1,
    });

    const columns = [
        {
            title: 'Prediction',
            dataIndex: 'result',
            key: 'result',
        },
        {
            title: 'Score',
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
        <Output.Section>
            <Output.SubSection>
                <Table
                    dataSource={data}
                    columns={columns}
                    pagination={false}
                    footer={() => (
                        <span>
                            Note: The prediction percentages are normalized across these five
                            sequences. The true probabilities are lower.
                        </span>
                    )}
                />
            </Output.SubSection>
            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
