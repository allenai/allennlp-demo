import React from 'react';
import { Divider, Form as AntForm } from 'antd';

import { Models, Examples } from '../../context';
import { NoSelectedModelError } from '../../error';
import { Promised, Success } from '../Promised';
import { Model } from '../../lib';

class EmptyFormError extends Error {
    constructor() {
        super(
            'The form was submitted while empty. This is indicative of a programming error and ' +
                'should not happen'
        );
    }
}

export type ModelSuccess<I, O> = Success<I, O> & { model: Model };
export type ModelSuccessRenderer<I, O> = (io: ModelSuccess<I, O>) => React.ReactNode | JSX.Element;

interface Props<I, O> {
    action: (modelId: string) => string;
    fields: React.ReactNode | JSX.Element;
    children: ModelSuccessRenderer<I, O>;
}

/**
 * A component for rendering a form for user-provided input.
 *
 * The inputs you'd like from the user should be passed as the `fields` property. Any valid
 * JSX expression can be passed, though for the data to be captured and dispatched to your
 * `action` each input must derive from `antd.Input`. There's probably an appropriate
 * input for the field type you're looking for provided by tugboat.
 *
 * The form expects a single child that's a function. The function will be passed a single
 * property which has information about the selected `model`, the user submitted `input`
 * and the `output` that was returned via the provided `action`.
 *
 * The function is only called when the `action` succeeds. While the `action` is being processed
 * a loading indicator is shown. If the `action` failds an error is shown to the user.
 *
 * @example
 * <Form<Input, Prediction>
 *     fields={
 *         <>
 *             <Question>
 *             <Passage>
 *         </>
 *     }>
 *     {({ model, input, output }) => (
 *         <Output>
 *             <Output.Section>
 *                 <h3>Returned Output</h3>
 *                 <code>{JSON.stringify(output, null, 2)}</code>
 *             </Output.Section>
 *         </Output>
 *     )}
 * </Form>
 */
export const Form = <I, O>(props: Props<I, O>) => {
    const [input, setInput] = React.useState<I>();
    const [form] = AntForm.useForm<I>();

    const models = React.useContext(Models);
    const submit = (body?: I) => {
        if (!body) {
            throw new EmptyFormError();
        }
        if (!models.selectedModel) {
            throw new NoSelectedModelError();
        }
        const url = props.action(models.selectedModel.id);
        const opt = { method: 'POST', body: JSON.stringify(body) };
        return fetch(url, opt).then((r) => r.json());
    };

    // When the selected model changes we clear the current input. This doesn't reset the
    // form values, but rather clears the output that's displayed so it's clear that it's
    // no longer relevant.
    React.useEffect(() => {
        setInput(undefined);
    }, [models.selectedModel]);

    // Whenever the selected example changes, set the appropriate form values.
    const examples = React.useContext(Examples);
    React.useEffect(() => {
        if (examples.selectedExample) {
            // The wide cast here is unfortunate, but probably worth the tradeoff. The type expected by
            // `antd` is a RecursivePartial<I>, but really `antd` should probably just expect
            // { [name: string]: any }, as the method ignores values where the corresponding `name`
            // doesn't match one of the fields the form contains.
            //
            // In other words, we can pass any ole' object to here, and if the keys of the object
            // match the names of fields that belong to the form, their values be updated.
            form.setFieldsValue(examples.selectedExample as any);

            // Again, when things change clear the input so that stale output isn't displayed.
            setInput(undefined);
        }
    }, [examples.selectedExample]);

    return (
        <>
            <AntForm<I>
                layout="vertical"
                hideRequiredMark
                onChange={
                    // Clear the output whenever a field is changed.
                    () => setInput(undefined)
                }
                onFinish={(v) => setInput(v)}
                form={form}>
                {props.fields}
            </AntForm>
            {input ? (
                <>
                    <Divider />
                    <Promised<I, O> input={input} fetch={submit}>
                        {(io) => {
                            if (!models.selectedModel) {
                                throw new NoSelectedModelError();
                            }
                            return props.children({ ...io, model: models.selectedModel });
                        }}
                    </Promised>
                </>
            ) : null}
        </>
    );
};
