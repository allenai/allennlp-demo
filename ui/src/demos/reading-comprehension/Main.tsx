/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Divider, Select, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Content } from '@allenai/varnish/components';

import {
    Form,
    Title,
    Description,
    Markdown,
    RunButton,
    ModelInfo,
    ModelUsageModal,
    ModelCardModal,
    useModels,
} from '../../tugboat';
import { demoConfig } from './config';

const Main = () => {
    const models = useModels('bidaf-elmo', 'bidaf', 'nmn', 'transformer-qa', 'naqanet');
    const [selectedModel, setSelectedModel] = React.useState<ModelInfo>();

    React.useEffect(() => {
        if (models && models.length > 0 && selectedModel === undefined) {
            setSelectedModel(models[0]);
        }
    });

    if (!models) {
        return (
            <Content>
                <Spin indicator={<LoadingOutlined style={{ fontSize: '2rem' }} spin />} />
            </Content>
        );
    }

    return (
        <Content>
            <Title>{demoConfig.title}</Title>
            <Description>
                <Markdown>
                    Reading comprehension is the task of answering questions about a passage of text
                    to show that the system understands the passage.
                </Markdown>
            </Description>
            <Form>
                <Form.Field>
                    <Form.Label>Model</Form.Label>
                    <Form.Select
                        value={selectedModel ? selectedModel.id : undefined}
                        onChange={(mid: string) => {
                            const m = models.find((m) => m.id === mid);
                            if (!m) {
                                console.error(new Error(`Invalid model id: ${mid}`));
                                return;
                            }
                            setSelectedModel(m);
                        }}
                        dropdownMatchSelectWidth={false}
                        optionLabelProp="label"
                        listHeight={370}>
                        {models.map((m) =>
                            m.model_card_data ? (
                                <Select.Option
                                    key={m.id}
                                    value={m.id}
                                    label={m.model_card_data.display_name}>
                                    <b>{m.model_card_data.display_name}</b>
                                    <Markdown>{m.model_card_data.description}</Markdown>
                                </Select.Option>
                            ) : null
                        )}
                    </Form.Select>
                </Form.Field>
                {selectedModel && selectedModel.model_card_data ? (
                    <>
                        <Markdown>{selectedModel.model_card_data.description}</Markdown>
                        <ModelUsageModal model={selectedModel.model_card_data} />
                        <ModelCardModal model={selectedModel.model_card_data} />
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

export default Main;
