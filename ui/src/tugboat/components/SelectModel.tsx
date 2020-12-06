import React from 'react';

import { FormElement, Field, Select } from './form';
import { Markdown } from './Markdown';
import { Models } from '../context';

export const SelectModel = () => {
    const ctx = React.useContext(Models);
    return (
        <FormElement>
            <Field label="Model">
                <Select
                    value={ctx.selectedModel?.id}
                    onChange={(id) => ctx.selectModelById(`${id}`)}
                    dropdownMatchSelectWidth={false}
                    optionLabelProp="label"
                    listHeight={370}>
                    {ctx.models.map((m) => (
                        <Select.Option key={m.id} value={m.id} label={m.card.display_name}>
                            <b>{m.card.display_name}</b>
                            <Markdown>{m.card.description}</Markdown>
                        </Select.Option>
                    ))}
                </Select>
            </Field>
        </FormElement>
    );
};
