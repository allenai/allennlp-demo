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

// TODO: [jon] remove once backend is fixed
export const Text = (props: BaseInputProps) => (
    <BaseInput label="Text" name="text" {...props}>
        <Input />
    </BaseInput>
);
