import React from 'react';
import { Button, Modal } from 'antd';

import { ModelInfo } from '../../lib';
import { Markdown } from './Markdown';

interface Props {
    model: ModelInfo;
}

export const ModelCardModal = ({ model }: Props) => {
    const [showModelCard, setShowModelCard] = React.useState<boolean>(false);

    return (
        <>
            <Button type="link" onClick={() => setShowModelCard(true)}>
                Model Card
            </Button>
            <Modal
                title="Model Card"
                visible={showModelCard}
                onOk={() => setShowModelCard(false)}
                onCancel={() => setShowModelCard(false)}
                footer={[
                    <Button key="submit" type="primary" onClick={() => setShowModelCard(false)}>
                        Close
                    </Button>,
                ]}>
                <div>
                    <h4>Name</h4>
                    {model.model_card_data?.display_name}
                    <h4>Description</h4>
                    {model.model_card_data ? (
                        <Markdown>{model.model_card_data.description}</Markdown>
                    ) : null}
                    <h4>ID</h4>
                    {model.id}
                </div>
            </Modal>
        </>
    );
};
