import React from 'react';
import { Button, Modal } from 'antd';

import { Models } from '../context';
import { NoSelectedModel } from '../error';
import { Markdown } from './Markdown';

const ModalContent = () => {
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModel();
    }

    return (
        <>
            <h4>Name</h4>
            {models.selectedModel.card.display_name}
            <h4>Description</h4>
            <Markdown>{models.selectedModel.card.description}</Markdown>
            <h4>ID</h4>
            {models.selectedModel.id}
        </>
    );
};

export const ModelCardModal = () => {
    const [showModelCard, setShowModelCard] = React.useState<boolean>(false);
    const models = React.useContext(Models);

    return (
        <>
            <Button
                type="link"
                onClick={() => setShowModelCard(true)}
                disabled={!models.selectedModel}>
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
                <ModalContent />
            </Modal>
        </>
    );
};
