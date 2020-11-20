import React from 'react';
import styled from 'styled-components';
import { Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Title = styled.h3`
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

export const Description = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const RunButton = styled(Button).attrs({
    type: 'primary',
})`
    margin-top: ${({ theme }) => theme.spacing.sm};
    margin-right: ${({ theme }) => theme.spacing.md};
`;

const LoadingIcon = styled(LoadingOutlined).attrs(() => ({ spin: true }))`
    font-size: 2rem;
`;

export const Loading = () => <Spin indicator={<LoadingIcon />} />;
