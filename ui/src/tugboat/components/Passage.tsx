import React from 'react';

import * as form from './form';

export const Passage = () => (
    <form.Field label="Passage" name="passage" rules={[{ required: true }]}>
        <form.TextArea />
    </form.Field>
);
