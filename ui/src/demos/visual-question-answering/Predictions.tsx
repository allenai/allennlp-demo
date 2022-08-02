import React from 'react';
import styled from 'styled-components';
import Table, { ColumnsType } from 'antd/es/table';
import { BasicFilterDropdown, FilterIcon } from '@allenai/varnish';
import { Output, Spark, SparkEnvelope, SparkValue } from '@allenai/tugboat/components';
import { Model } from '@allenai/tugboat/lib';

import { DebugInfo } from '../../components';
import { Input, Prediction, Answer } from './types';

interface Props {
    input: Input;
    model: Model;
    output: Prediction;
}

export const Predictions = ({ input, model, output }: Props) => {
    const percent = new Intl.NumberFormat(navigator.language, {
        style: 'percent',
        maximumFractionDigits: 1,
    });

    const answerPageSize = 15;
    const answerColumns: ColumnsType<Answer> = [
        {
            title: 'Score',
            dataIndex: 'confidence',
            key: 'confidence',
            render: (val: number) => (
                <div title={val.toString()}>
                    <SparkEnvelope>
                        <Spark value={val} />
                    </SparkEnvelope>{' '}
                    <SparkValue>{percent.format(val / 100)}</SparkValue>
                </div>
            ),
            sorter: (a: Answer, b: Answer) => a.confidence - b.confidence,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Answer',
            dataIndex: 'answer',
            key: 'answer',
            sorter: (a: Answer, b: Answer) => (a.answer < b.answer ? -1 : 1),
            sortDirections: ['descend', 'ascend'],
            filterDropdown: BasicFilterDropdown,
            filterIcon: FilterIcon,
            onFilter: (filter, record: Answer) =>
                record.answer.toLowerCase().includes(filter.toString().toLowerCase()),
        },
    ];

    return (
        <Output.Section>
            <Output.SubSection>
                <StyledTable
                    size="small"
                    scroll={{ x: true }}
                    rowKey={(record: Answer) => `${record.answer}_${record.confidence}`}
                    columns={answerColumns}
                    dataSource={output}
                    pagination={
                        output.length > answerPageSize && {
                            pageSize: answerPageSize,
                            simple: true,
                        }
                    }
                />
            </Output.SubSection>

            <DebugInfo input={input} output={output} model={model} />
        </Output.Section>
    );
};

const AnswerTable = (p: any) => Table<Answer>(p);

const StyledTable = styled(AnswerTable)`
    table {
        min-width: 98vw !important; // boo! there seems to be an error in the width of the inner table
    }
`;
