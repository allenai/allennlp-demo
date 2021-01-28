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

export const Predictions = ({ input, model, output }: Props) => {
    const getResult = (replacement: string, maskNumber: number) => {
        const ret: React.ReactNodeArray = [];
        let masksSeen = 0;
        output.tokens
            .filter((v) => v !== '[CLS]' && v !== '[SEP]')
            .forEach((t, i) => {
                let r = <span key={i}>{`${t}${' '}`}</span>;
                if (t === '[MASK]') {
                    if (masksSeen === maskNumber) {
                        r = <strong key={i}>{`${replacement}${' '}`}</strong>;
                    } else {
                        r = <i key={i}>{`[MASK${masksSeen + 1}${'] '}`}</i>;
                    }
                    masksSeen++;
                }
                ret.push(r);
            });
        return ret;
    };

    const maskList = output.words.map((words, i) => {
        return {
            key: i,
            maskPrediction: words.map((w, j) => {
                return {
                    key: w,
                    word: w,
                    probability: output.probabilities[i][j],
                    result: getResult(w, i),
                };
            }),
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
            {maskList.map((m) => (
                <Output.SubSection key={m.key} title={`Mask ${m.key + 1}`}>
                    <Table dataSource={m.maskPrediction} columns={columns} pagination={false} />
                </Output.SubSection>
            ))}
            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};
