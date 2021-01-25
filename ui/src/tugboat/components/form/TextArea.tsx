import React from 'react';

import { FieldItem, TextArea as AntTextArea } from './controls';

/**
 * A component that renders a multiline text input for capturing a large body of text to be
 * processed by a model.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    property: string;
}

export const TextArea = ({ property }: Props) => (
    <FieldItem
        label={property.charAt(0).toUpperCase() + property.slice(1)}
        name={property}
        rules={[{ required: true }]}>
        <AntTextArea />
    </FieldItem>
);
