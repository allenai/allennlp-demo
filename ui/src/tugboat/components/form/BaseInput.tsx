import React from 'react';
import { RuleObject } from 'antd/lib/form';

import { FieldItem } from './controls';

/**
 * Base class for Input components capturing input to be processed by a model.
 *
 * The component should be a child of the Fields component.
 */

export interface BaseInputProps {
    validator?: (_: RuleObject, text: any) => Promise<undefined>;
}

interface Props extends BaseInputProps {
    label: string;
    name: string;
    children: React.ReactNode;
}

export const BaseInput = ({ label, name, validator, children }: Props) => (
    <FieldItem
        label={label}
        name={name}
        rules={[
            { required: true },
            {
                validator: validator,
            },
        ]}>
        {children}
    </FieldItem>
);
