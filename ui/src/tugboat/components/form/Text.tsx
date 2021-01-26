import React from 'react';

import { TextArea } from './controls';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * A component that renders a multiline text input for capturing a large body of text to be
 * processed by a model.
 *
 * The component should be a child of the Fields component.
 */
export const Text = (props: BaseInputProps) => (
    <BaseInput label="Text" name="text" {...props}>
        <TextArea />
    </BaseInput>
);
