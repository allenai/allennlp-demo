/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Divider, Select, Form, Input, Button } from 'antd';
import { Content } from '@allenai/varnish/components';

import {
    Title,
    Description,
    Markdown,
    ModelCard,
    getModelCards,
    ModelUsageModal,
    ModelCardModal,
} from '../../tugboat';
import { demoConfig } from './config';

const Main = () => {
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
            <Form layout="vertical">
                <Form.Item label="Model">
                    <Select 
                        value={modelId}
                        onChange={(mid: string) => setModelId(mid)}
                        dropdownMatchSelectWidth={false}
                        optionLabelProp="label"
                        listHeight={370}
                    >
                        {modelCards.map((m) => (
                            <Select.Option key={m.id} value={m.id} label={m.display_name}>
                                <b>{m.display_name}</b>
                                <Markdown>{m.description}</Markdown>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
            {model ? (
                <>
                    <Markdown>{model.description}</Markdown>
                    <ModelUsageModal model={model} />
                    <ModelCardModal model={model} />
                </>
            ) : null}
            <Form layout="vertical">
                <Input type="hidden" name="modelId" value={modelId} />
                <Form.Item label="Choose an Example:">
                    <Select placeholder="Examples…" /> 
                </Form.Item>
                <Form.Item label="Passage:" name="passage">
                    <Input.TextArea placeholder="Enter a passage…" />
                </Form.Item>
                <Form.Item label="Question:" name="question">
                    <Input placeholder="Enter a question…" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary">Run Model</Button>
                </Form.Item>
            </Form>
            <Divider />
            {/* TODO: Answer */}
        </Content>
    );
};

export { demoConfig };
export default Main;
