import React from 'react';
import { Descriptions } from 'antd';

import { Models } from '../context';
import { NoSelectedModel } from '../error';
import { Markdown } from './Markdown';

export const ModelCard = () => {
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModel();
    }

    return (
        <Descriptions
            layout="horizontal"
            size="small"
            column={{ xxl: 3, xl: 3, lg: 3, md: 1, sm: 1, xs: 1 }}
            bordered={true}>
            <Descriptions.Item label="Name">
                {models.selectedModel.card.display_name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Registered Name">
                {models.selectedModel.card.registered_model_name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="ID"> {models.selectedModel.id}</Descriptions.Item>

            <Descriptions.Item label="Description" span={3}>
                <Markdown>
                    {`${models.selectedModel.card.short_description}${' '}${
                        models.selectedModel.card.description
                    }`}
                </Markdown>
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated" span={3}>
                {models.selectedModel.card.date || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Version" span={3}>
                {models.selectedModel.card.version || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Model Type" span={3}>
                {models.selectedModel.card.model_type || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Predictor Name" span={3}>
                {models.selectedModel.card.registered_predictor_name || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Performance Measure" span={3}>
                {models.selectedModel.card.model_performance_measures || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Evaluation Dataset" span={3}>
                {models.selectedModel.card.evaluation_dataset || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Training Dataset" span={3}>
                {models.selectedModel.card.training_dataset || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Archive File" span={3}>
                {models.selectedModel.card.archive_file ? (
                    <a download href={models.selectedModel.card.archive_file}>
                        {models.selectedModel.card.archive_file}
                    </a>
                ) : (
                    'Unknown'
                )}
            </Descriptions.Item>

            <Descriptions.Item label="Developed By" span={3}>
                {models.selectedModel.card.developed_by || 'Unknown'}
            </Descriptions.Item>

            <Descriptions.Item label="Paper" span={3}>
                <Markdown>{models.selectedModel.card.paper || 'Unknown'}</Markdown>
            </Descriptions.Item>

            <Descriptions.Item label="Citation" span={3}>
                <Markdown>{models.selectedModel.card.citation || 'Unknown'}</Markdown>
            </Descriptions.Item>

            <Descriptions.Item label="Contact" span={3}>
                {models.selectedModel.card.contact ? (
                    <a href={`mailto: ${models.selectedModel.card.contact}`}>
                        {models.selectedModel.card.contact}
                    </a>
                ) : (
                    'Unknown'
                )}
            </Descriptions.Item>
        </Descriptions>
    );
};
