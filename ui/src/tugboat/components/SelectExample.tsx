import React from 'react';
import { Form } from 'antd';

import { FieldItem, Select } from './form';
import { Examples } from '../context';

import { Example, flattenExamples, isGroupedExamples } from '../lib';
import { InvalidDisplayPropError, DuplicateDisplayPropValueError } from '../error';

interface Props {
    displayProp: string;
    placeholder?: string;
    examples?: Example[];
    onChange?: (val?: Example) => void;
}

/**
 * Renders a component that can be used to select an example input. The input is populated
 * by the examples returned for the current task, per the `get_tasks()` method.
 *
 * The provided `displayProp` must be the name of a property that each example has. If two
 * examples have the same value for `displayProp`, an `DuplicateDisplayPropValueError` will be
 * thrown.
 *
 * See: https://github.com/allenai/allennlp-models/blob/master/allennlp_models/pretrained.py#L24
 */
export const SelectExample = ({ displayProp, placeholder, examples, onChange }: Props) => {
    const ctx = React.useContext(Examples);

    // The `<Select />` component we use expects that each value has a string value for uniquely
    // identifying it. The examples don't by default include this, but we use the value of the
    // property referenced by `displayProp` to derive a value that should be unique. This makes
    // sense as the the value of `displayProp` is what's displayed in the select menu for
    // each example. If two examples have exactly the same display value there's no way for
    // the user to tell them a part, which is bad for the end UX. We prevent that from happening
    // by insisting that it's unique.
    const examplesById: { [id: string]: Example } = {};

    // We will use any examples passed in, if none are passed, we will use the ones from the api.
    let flatExamples = examples;
    if (!flatExamples) {
        flatExamples = flattenExamples(ctx.examples);
    }

    for (const example of flatExamples) {
        const id = example[displayProp];
        if (!id) {
            throw new InvalidDisplayPropError(displayProp);
        }
        if (id in examplesById) {
            throw new DuplicateDisplayPropValueError(displayProp, id);
        }
        examplesById[id] = example;
    }

    return (
        <Form layout="vertical">
            <FieldItem label="Example Inputs">
                <Select
                    value={ctx.selectedExample ? ctx.selectedExample[displayProp] : undefined}
                    onChange={(id) => {
                        const selValue = examplesById[`${id}`];
                        onChange && onChange(selValue);
                        return ctx.selectExample(selValue);
                    }}
                    placeholder={placeholder || 'Select an Example…'}>
                    {isGroupedExamples(ctx.examples)
                        ? Object.entries(ctx.examples).map(([g, ex]) => (
                              <Select.OptGroup key={g} label={g}>
                                  {ex.map((e) => {
                                      const id = e[displayProp];
                                      return (
                                          <Select.Option key={id} value={id}>
                                              {id}
                                          </Select.Option>
                                      );
                                  })}
                              </Select.OptGroup>
                          ))
                        : ctx.examples.map((e) => {
                              const id = e[displayProp];
                              return (
                                  <Select.Option key={id} value={id} label={id}>
                                      {id}
                                  </Select.Option>
                              );
                          })}
                </Select>
            </FieldItem>
        </Form>
    );
};
