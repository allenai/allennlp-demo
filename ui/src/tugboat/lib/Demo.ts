import React from 'react';

import { DemoConfig } from './DemoConfig';

export interface Demo {
    config: DemoConfig;
    /**
     * The `<Component />` to render when your demo is active.
     */
    Component: React.Component;
}
