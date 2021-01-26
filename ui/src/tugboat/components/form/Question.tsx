import React from 'react';

import { Input } from './controls';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * A component that renders a single line text input for capturing a question that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Question = (props: BaseInputProps) => (
    <BaseInput label="Question" name="question" {...props}>
        <Input />
    </BaseInput>
);
