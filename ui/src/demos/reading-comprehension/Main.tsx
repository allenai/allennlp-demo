import React from 'react';
import { Divider } from 'antd';
import { Content } from '@allenai/varnish/components';

import { form, Title, Description, Markdown, Loading, ErrorMessage } from '../../tugboat';
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
    const modelStore = useModels<Input, Output>(
        'bidaf-elmo',
        'bidaf',
        'nmn',
        'transformer-qa',
        'naqanet'
    );

    if (modelStore.isLoadingModels()) {
        return (
            <Content>
                <Loading />
            </Content>
        );
    }

    if (!modelStore.hasLoadedModels()) {
        const message = modelStore.failedToLoadModels()
            ? 'The demo failed to load. Please try again.'
            : undefined;
        return (
            <Content>
                <ErrorMessage message={message} />
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
            <form.ModelSelect
                options={modelStore.models}
                selected={modelStore.selectedModel}
                onChange={(id) => modelStore.selectModelById(id)}
            />
            <form.Form
                onFinish={(input) => {
                    // TODO: Is there a way we can get `antd` to negate the need for this cast.
                    modelStore.fetchPredictionsUsingSelectedModel(input as Input);
                }}>
                <Markdown>
                    {modelStore.selectedModel.info.model_card_data?.description || ''}
                </Markdown>
                <ModelUsageModal model={modelStore.selectedModel.info} />
                <ModelCardModal model={modelStore.selectedModel.info} />
                <form.Field label="Select an Example">
                    <form.Select placeholder="Examples..." />
                </form.Field>
                <form.Field
                    label="Passage"
                    name="passage"
                    rules={[{ required: true }]}
                    tooltip="Some text that the model should use to try and answer the question.">
                    <form.TextArea />
                </form.Field>
                <form.Field
                    label="Question"
                    name="question"
                    rules={[{ required: true }]}
                    tooltip="The question the model should attempt to answer using the input passage.">
                    <form.Input />
                </form.Field>
                <form.Field>
                    <form.Submit loading={modelStore.isPredicting()}>Run Model</form.Submit>
                </form.Field>
            </form.Form>
            <Divider />
            {modelStore.failedToPredict() ? (
                <ErrorMessage message="Prediction failed. Please try again" />
            ) : null}
            {modelStore.hasPrediction() ? (
                <pre>{JSON.stringify(modelStore.currentPrediction, null, 2)}</pre>
            ) : null}
        </Content>
    );
};
