import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Title = styled.h3`
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

export const Description = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LoadingIcon = styled(LoadingOutlined).attrs(() => ({ spin: true }))`
    font-size: 2rem;
    color: ${({ theme }) => theme.color.B6};
`;

export const Loading = () => <Spin indicator={<LoadingIcon />} />;
