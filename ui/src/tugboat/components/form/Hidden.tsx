import React from 'react';

import { FieldItem, TextArea } from './controls';

/**
 * A component that holds a value for the api, but is not rendered.
 *
 * The component should be a child of the Fields component.
 */
interface Props {
    name: string;
    value?: any;
}

export const Hidden = ({ name, value }: Props) => {
    return (
        <FieldItem hidden name={name} initialValue={JSON.stringify(value)}>
            <TextArea />
        </FieldItem>
    );
};
