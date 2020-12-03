/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Divider, Select } from 'antd';
import { Content } from '@allenai/varnish/components';

import { Form, Title, Description, Markdown, RunButton, Loading } from '../../tugboat';
import { ModelUsageModal, ModelCardModal } from '../../components';
import { useModels } from '../../lib';
import { config } from './config';

interface Input {
    passage: string;
    question: string;
}

interface BiDAFOutput {
    best_span: number[];
    best_span_str: string;
    passage_question_attention: number[][];
    passage_tokens: string[];
    question_tokens: string[];
    span_end_logits: number[];
    span_end_probs: number[];
    span_start_logits: number[];
    span_start_probs: number[];
    token_offsets: number[][];
}

interface TransformerQAOutput {
    best_span: number[];
    best_span_scores: number;
    best_span_str: string;
    context_tokens: string[];
    id: string;
    span_end_logits: number[];
    span_start_logits: number[];
}

// TODO: Figure out what other types exist
enum NAQANetAnswerType {
    PassageSpan = 'passage_span',
}

interface NAQANetOutput {
    answer: {
        'answer-type': NAQANetAnswerType;
        spans: number[];
        value: string;
    };
    loss: number;
    passage_question_attention: number[][];
    passage_tokens: string[];
    /* NOTE: This might be "None", which is Python's equivalent for undefined / null. There's
     * some errant serialization in the backend that should in the long run be fixed to correct
     * this.
     */
    question_id: string;
    question_tokens: string[];
}

type Output = BiDAFOutput | TransformerQAOutput | NAQANetOutput;

export const Main = () => {
    // TODO: NMN doesn't return anything right now (there's no `/info` route, I think), so it's
    // not present. We need to fix this.
    const [models, selectModel, fetchPredictions] = useModels<Input, Output>(
        'bidaf-elmo',
        'bidaf',
        'nmn',
        'transformer-qa',
        'naqanet'
    );

    if (!models.hasModels) {
        return (
            <Content>
                <Loading />
            </Content>
        );
    }

    return (
        <Content>
            <Title>{config.title}</Title>
            <Description>
                <Markdown>
                    Reading comprehension is the task of answering questions about a passage of text
                    to show that the system understands the passage.
                </Markdown>
            </Description>
            <Form.Field label="Model">
                <Form.Select
                    value={models.selected?.model.info.id}
                    onChange={selectModel}
                    dropdownMatchSelectWidth={false}
                    optionLabelProp="label"
                    listHeight={370}
                >
                    {models.all.map((m) =>
                        m.info.model_card_data ? (
                            <Select.Option
                                key={m.info.id}
                                value={m.info.id}
                                label={m.info.model_card_data.display_name}>
                                <b>{m.info.model_card_data.display_name}</b>
                                <Markdown>{m.info.model_card_data.description}</Markdown>
                            </Select.Option>
                        ) : null
                    )}
                </Form.Select>
            </Form.Field>
            <Form onFinish={fetchPredictions}>
                {models.selected && models.selected.model.info.model_card_data ? (
                    <>
                        <Markdown>{models.selected.model.info.model_card_data.description}</Markdown>
                        <ModelUsageModal model={models.selected.model.info} />
                        <ModelCardModal model={models.selected.model.info} />
                    </>
                ) : null}
                <Form.Field label="Select an Example">
                    <Form.Select placeholder="Examples..." />
                </Form.Field>
                <Form.Field
                    label="Passage"
                    name="passage"
                    rules={[{ required: true }]}
                    tooltip="Some text that the model should use to try and answer the question.">
                    <Form.TextArea />
                </Form.Field>
                <Form.Field
                    label="Question"
                    name="question"
                    rules={[{ required: true }]}
                    tooltip="The question the model should attempt to answer using the input passage.">
                    <Form.Input />
                </Form.Field>
                <Form.Field>
                    {/* TODO: Consider <Form.Submit>Run Model</Form.Submit>? */}
                    <RunButton loading={models.selected?.isPredicting()}>Run Model</RunButton>
                </Form.Field>
            </Form>
            <Divider />
            {models.selected?.hasPredictions() ? (
                <code>
                    <pre>{JSON.stringify(models.selected?.state.predictions, null, 2)}</pre>
                </code>
            ) : null}
        </Content>
    );
};
