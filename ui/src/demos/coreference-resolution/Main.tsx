/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Content } from '@allenai/varnish/components';

import { Title } from '../../tugboat/components';
import { config } from './config';

export const Main = () => {
    return (
        <Content>
            <Title>{config.title}</Title>
            NOTE: This task is under development
        </Content>
    );
};
