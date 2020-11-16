/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import {
    DemoConfig,
    Form,
    Title,
    Description,
    Markdown,
    RunButton,
    ModelCard,
    getModelCards,
    ModelUsageModal,
    ModelCardModal,
} from '../tugboat';
import { Divider, Select } from 'antd';
import { Content } from '@allenai/varnish/components';

export const demoConfig: DemoConfig = {
    demoGroup: 'Answer a question',
    title: 'Reading Comprehension',
    order: 1,
    status: 'hidden',
};

const Demo = () => {
    const [modelCards, setModelCards] = React.useState<ModelCard[]>([]);
    const [modelId, setModelId] = React.useState<string>();
    const [model, setModel] = React.useState<ModelCard>();

    // TODO: make a hook to hold this code?
    React.useEffect(() => {
        fetch('/api/info')
            .then((r) => r.json())
            .then((r) =>
                setModelCards(
                    getModelCards(r, ['bidaf-elmo', 'bidaf', 'nmn', 'transformer-qa', 'naqanet'])
                )
            );
    }, [false]);

    React.useEffect(() => {
        if (modelCards && modelCards.length) {
            setModelId(modelCards[0].id);
        }
    }, [modelCards]);

    React.useEffect(() => {
        const found = modelCards.filter((m: ModelCard) => m.id === modelId);
        if (found.length) {
            setModel(found[0]);
        }
    }, [modelId]);

    return (
        <Content>
            <Title>{demoConfig.title}</Title>
            <Description>
                <Markdown>
                    Reading comprehension is the task of answering questions about a passage of text
                    to show that the system understands the passage.
                </Markdown>
            </Description>
            <h6>Try it for yourself</h6>
            <Form>
                <Form.Field>
                    <Form.Label>Model</Form.Label>
                    <Form.Select
                        value={modelId}
                        onChange={(mid: string) => setModelId(mid)}
                        dropdownMatchSelectWidth={false}
                        optionLabelProp="label"
                        listHeight={370}>
                        {modelCards.map((m) => (
                            <Select.Option key={m.id} value={m.id} label={m.display_name}>
                                <b>{m.display_name}</b>
                                <Markdown>{m.description}</Markdown>
                            </Select.Option>
                        ))}
                    </Form.Select>
                </Form.Field>
                {model ? (
                    <>
                        <Markdown>{model.description}</Markdown>
                        <ModelUsageModal model={model} />
                        <ModelCardModal model={model} />
                    </>
                ) : null}
                <Form.Field>
                    <div>Chose a Passage and a Question</div>
                    <Form.Select placeholder="Examples..." />
                </Form.Field>
                <Form.Field>
                    <Form.Label>Passage</Form.Label>
                    <Form.TextArea />
                </Form.Field>
                <Form.Field>
                    <Form.Label>Question</Form.Label>
                    <Form.Input />
                </Form.Field>
                <RunButton>Run Model</RunButton>
            </Form>
            <Divider />
            // TODO: answer
        </Content>
    );
};

export default Demo;
