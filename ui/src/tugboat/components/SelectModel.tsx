import React from 'react';

import { Select } from './form';
import { Markdown } from './Markdown';
import { Models } from '../context';

/**
 * A basic component that's used in to select a single model.
 */
export const SelectModel = () => {
    const ctx = React.useContext(Models);
    return (
        <Select value={ctx.selectedModel?.id} onChange={(id) => ctx.selectModelById(`${id}`)}>
            {ctx.models.map((m) => (
                <Select.Option key={m.id} value={m.id} label={m.card.display_name}>
                    <b>{m.card.display_name}</b>
                    <Markdown>{m.card.short_description || m.card.description}</Markdown>
                </Select.Option>
            ))}
        </Select>
    );
};
