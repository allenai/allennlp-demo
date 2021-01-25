import React from 'react';

import { FieldItem, TextArea } from './controls';

/**
 * A component that renders a multiline text input for capturing a large body of text to be
 * processed by a model.
 *
 * The component should be a child of the Fields component.
 */
export const Passage = () => (
    <FieldItem label="Passage" name="passage" rules={[{ required: true }]}>
        <TextArea />
    </FieldItem>
);
