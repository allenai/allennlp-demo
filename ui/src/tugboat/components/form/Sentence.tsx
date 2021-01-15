import React from 'react';

import { Field, Input } from './controls';

/**
 * A component that renders a single line text input for capturing a sentence that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Sentence = () => (
    <Field label="Sentence" name="sentence" rules={[{ required: true }]}>
        <Input />
    </Field>
);
