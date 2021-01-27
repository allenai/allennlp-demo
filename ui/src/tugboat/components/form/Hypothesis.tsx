import React from 'react';

import { Input } from './controls';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * A component that renders a single line text input for capturing a hypothesis that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Hypothesis = (props: BaseInputProps) => (
    <BaseInput label="Hypothesis" name="hypothesis" {...props}>
        <Input />
    </BaseInput>
);
