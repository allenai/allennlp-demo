/*
    Note: this file is in development and should only be viewed as example code direction
*/

import React from 'react';
import { Content } from '@allenai/varnish/components';

import { Title } from '../../tugboat';
import { demoConfig } from './config';

const Main = () => {
    return (
        <Content>
            <Title>{demoConfig.title}</Title>
            NOTE: This task is under development
        </Content>
    );
};

export { demoConfig };
export default Main;
