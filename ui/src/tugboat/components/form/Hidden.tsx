import React from 'react';

import { FieldItem, TextArea } from './controls';

/**
 * A component that holds a value for the api, but is not rendered.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    name: string;
    value: string;
}

export const Hidden = ({ name, value }: Props) => (
    <FieldItem hidden name={name} initialValue={value}>
        <TextArea />
    </FieldItem>
);
