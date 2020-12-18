import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingIcon = styled(LoadingOutlined).attrs(() => ({ spin: true }))`
    font-size: 2rem;
    svg {
        fill: ${({ theme }) => theme.color.B6};
    }
`;

export const Loading = () => <Spin indicator={<LoadingIcon />} />;
