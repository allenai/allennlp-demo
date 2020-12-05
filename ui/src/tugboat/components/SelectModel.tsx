import React from 'react';

import * as form from './form';
import { Markdown } from './Markdown';
import { Models } from '../context';

export const SelectModel = () => {
    const ctx = React.useContext(Models);
    return (
        <form.Form>
            <form.Field label="Model">
                <form.Select
                    value={ctx.selectedModel?.id}
                    onChange={(id) => ctx.selectModelById(`${id}`)}
                    dropdownMatchSelectWidth={false}
                    optionLabelProp="label"
                    listHeight={370}>
                    {ctx.models.map((m) => (
                        <form.Select.Option key={m.id} value={m.id} label={m.card.display_name}>
                            <b>{m.card.display_name}</b>
                            <Markdown>{m.card.description}</Markdown>
                        </form.Select.Option>
                    ))}
                </form.Select>
            </form.Field>
        </form.Form>
    );
};
