import React from 'react';

import { Field, TextArea } from './controls';

export const Passage = () => (
    <Field label="Passage" name="passage" rules={[{ required: true }]}>
        <TextArea />
    </Field>
);
