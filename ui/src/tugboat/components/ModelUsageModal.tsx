import React from 'react';
import { Button, Modal } from 'antd';

import { Models } from '../context';
import { NoSelectedModel } from '../error';

const ModalContent = () => {
    const models = React.useContext(Models);
    if (!models.selectedModel) {
        throw new NoSelectedModel();
    }

    return (
        <>
            <h4>Installing AllenNLP</h4>
            {models.selectedModel.card.display_name}
            <h4>Prediction</h4>
            <h5>On the command line (bash):</h5>
            <h5>As a library (python):</h5>
            <h4>Evaluation</h4>
            <h4>Training</h4>
            <h4>Installing AllenNLP</h4>
        </>
    );
};

export const ModelUsageModal = () => {
    const [showUsage, setShowUsage] = React.useState<boolean>(false);
    const models = React.useContext(Models);

    return (
        <>
            <Button type="link" onClick={() => setShowUsage(true)} disabled={!models.selectedModel}>
                Usage
            </Button>
            <Modal
                title="Model Usage"
                visible={showUsage}
                onOk={() => setShowUsage(false)}
                onCancel={() => setShowUsage(false)}
                footer={[
                    <Button key="submit" type="primary" onClick={() => setShowUsage(false)}>
                        Close
                    </Button>,
                ]}>
                <ModalContent />
            </Modal>
        </>
    );
};
