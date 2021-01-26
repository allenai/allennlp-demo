import React from 'react';

import { Input } from './controls';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * A component that renders a single line text input for capturing a sentence that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Sentence = (props: BaseInputProps) => (
    <BaseInput label="Sentence" name="sentence" {...props}>
        <Input />
    </BaseInput>
);
