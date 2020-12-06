import React from 'react';

import { Field, Input } from './controls';

export const Question = () => (
    <Field label="Question" name="question" rules={[{ required: true }]}>
        <Input />
    </Field>
);
