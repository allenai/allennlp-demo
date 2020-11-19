import React from 'react';
import { Button, Modal } from 'antd';

import { ModelCard } from './ModelCard';

interface Props {
    model: ModelCard;
}

export const ModelUsageModal = ({ model }: Props) => {
    const [showUsage, setShowUsage] = React.useState<boolean>(false);

    return (
        <>
            <Button type="link" onClick={() => setShowUsage(true)}>
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
                <h4>Installing AllenNLP</h4>
                {model.display_name}
                <h4>Prediction</h4>

                <h5>On the command line (bash):</h5>

                <h5>As a library (python):</h5>

                <h4>Evaluation</h4>

                <h4>Training</h4>

                <h4>Installing AllenNLP</h4>
            </Modal>
        </>
    );
};
