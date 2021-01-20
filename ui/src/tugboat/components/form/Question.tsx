import React from 'react';

import { FieldItem, Input } from './controls';

/**
 * A component that renders a single line text input for capturing a question that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Question = () => (
    <FieldItem label="Question" name="question" rules={[{ required: true }]}>
        <Input />
    </FieldItem>
);
