import React from 'react';

import * as form from './form';

export const Question = () => (
    <form.Field label="Question" name="question" rules={[{ required: true }]}>
        <form.Input />
    </form.Field>
);
