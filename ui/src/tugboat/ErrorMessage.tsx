import React from 'react';
import { Alert } from 'antd';

interface Props {
    message?: string;
}

export const ErrorMessage = ({ message }: Props = { message: 'An unknown error occured.' }) => (
    <Alert type="error" message="Error" description={message} showIcon />
);
