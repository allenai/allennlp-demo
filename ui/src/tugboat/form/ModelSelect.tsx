import React from 'react';

// TODO: Right now the Model definition is AllenNLP specific, so it doesn't live in Tugboat.
// That said, this code clearly needs it. We probably need to determine what our minimal viable
// representation of a model looks like, and migrate all of the model code (back) into Tugboat.
// Then write something that allows individual projects to define adapters that map their
// Models (and the way to resolve them) to our more general one.
import { Model } from '../../lib/Model';
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
                    // TODO: This cast shouldn't be necessary.
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
