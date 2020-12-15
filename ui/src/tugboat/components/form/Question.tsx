import React from 'react';

import { Field, Input } from './controls';

/**
 * A component that renders a single line text input for capturing a question that's to be
 * submitted to a model.
 */
export const Question = () => (
    <Field label="Question" name="question" rules={[{ required: true }]}>
        <Input />
    </Field>
);
