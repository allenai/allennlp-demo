import React from 'react';

import { FieldItem, Input } from './controls';

/**
 * A component that renders a single line text input for capturing a premise that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Premise = () => (
    <FieldItem label="Premise" name="premise" rules={[{ required: true }]}>
        <Input />
    </FieldItem>
);
