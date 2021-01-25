import React from 'react';

import { FieldItem, Input } from './controls';

/**
 * A component that renders a single line text input for capturing a hypothesis that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Hypothesis = () => (
    <FieldItem label="Hypothesis" name="hypothesis" rules={[{ required: true }]}>
        <Input />
    </FieldItem>
);
