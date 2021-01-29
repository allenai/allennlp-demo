import React from 'react';
import { Table } from 'antd';

import { DebugInfo } from '../../components';
import { Output, Spark, SparkEnvelope, SparkValue } from '../../tugboat/components';
import { Input, Prediction } from './types';
import { Model } from '../../tugboat/lib';

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
    const cleanTopTokensForDisplay = (tokens: string[]) => {
        // get rid of CRs
        const cleanWord = tokens
            .join('')
            .replace(' ,', ',')
            .replace(/\n/g, '↵')
            .replace(/Ġ/g, ' ')
            .replace(/Ċ/g, '↵');

        return cleanWord.slice(-1) === '.' ? cleanWord : cleanWord.concat(' ...');
    };
    // TODO: these links need to kick off a new model request like an attack
    return (
        <span>
            {input.sentence}{' '}
            <a href="">
                <strong>{cleanTopTokensForDisplay(pred)}</strong>
            </a>
        </span>
    );
};

export const Predictions = ({ input, model, output }: Props) => {
    const formatProbability = (probs: number[], idx: number) => {
        // normalize the displayed probabilities
        var sum = probs.reduce(function (a, b) {
            return a + b;
        }, 0);
        var prob = probs[idx] / sum;
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
