import React from 'react';

import { FieldItem, Input as AntInput } from './controls';

/**
 * A component that renders a single line text input for capturing a question that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    property: string;
}

export const Input = ({ property }: Props) => (
    <FieldItem
        label={property.charAt(0).toUpperCase() + property.slice(1)}
        name={property}
        rules={[{ required: true }]}>
        <AntInput />
    </FieldItem>
);
