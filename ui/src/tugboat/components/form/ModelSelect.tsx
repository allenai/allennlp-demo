import React from 'react';

import { Model } from '../../../lib/Model';
import { Form, Field, Select } from './';
import { Markdown } from '../Markdown';

interface Props {
    options: Model<any, any>[];
    selected?: Model<any, any>;
    onChange?: (modelId: string) => void;
}

export const ModelSelect = ({ options, selected, onChange }: Props) => (
    <Form>
        <Field label="Model">
            <Select
                value={selected?.info.id}
                onChange={(id) => {
                    if (onChange === undefined) {
                        return;
                    }
                    // The `id` is a string, though `antd` says it's a `SelectValue`. This means
                    // this cast is safe.
                    onChange(id as string);
                }}
                dropdownMatchSelectWidth={false}
                optionLabelProp="label"
                listHeight={370}>
                {options.map((m) => {
                    const displayName = m.info.model_card_data?.display_name || m.info.id;
                    const description = m.info.model_card_data?.description || '';
                    return (
                        <Select.Option key={m.info.id} value={m.info.id} label={displayName}>
                            <b>{displayName}</b>
                            <Markdown>{description}</Markdown>
                        </Select.Option>
                    );
                })}
            </Select>
        </Field>
    </Form>
);
