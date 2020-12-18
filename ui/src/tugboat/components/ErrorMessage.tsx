import React from 'react';
import { Alert } from 'antd';

interface Props {
    message?: string;
}

export const ErrorMessage = ({ message }: Props) => (
    <Alert
        type="error"
        message="Error"
        description={message || 'Sorry, an unknown error occured.'}
        showIcon
    />
);
