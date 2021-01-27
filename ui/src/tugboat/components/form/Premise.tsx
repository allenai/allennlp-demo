import React from 'react';

import { Input } from './controls';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * A component that renders a single line text input for capturing a premise that's to be
 * submitted to a model.
 *
 * The component should be a child of the Fields component.
 */
export const Premise = (props: BaseInputProps) => (
    <BaseInput label="Premise" name="premise" {...props}>
        <Input />
    </BaseInput>
);
