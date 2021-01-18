import React, { useContext, useEffect, useState } from 'react';
import { generatePath } from 'react-router';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Divider, Form as AntForm } from 'antd';

import { Examples, Models } from '../../context';
import { Model, flattenExamples } from '../../lib';
import { Promised, Success } from '../Promised';
import { NoSelectedModelError } from '../../error';
import { Share } from '../share';

export type ModelSuccess<I, O> = Success<I, O> & { model: Model };
export type ModelSuccessRenderer<I, O> = (io: ModelSuccess<I, O>) => React.ReactNode | JSX.Element;

const { useForm } = AntForm;

export type FormOutputView<I, O> = (io: {
    input: I;
    model: Model;
    output: O;
}) => React.ReactNode | JSX.Element;

interface Props<I, O> {
    /* The url the form will be sumitted to. */
    action: string;
    /* The form fields defining the data that will be submitted. */
    fields: React.ReactNode | JSX.Element;
    /* A version string for the data that's sent and received.
     * Used for fetching saved input that's assocaited with a shareable URL */
    version?: string;
    children: FormOutputView<I, O>;
}

type FormImplProps<I, O> = Omit<Props<I, O>, 'version'> & { shared?: I };

const FormImpl = <I, O>({ action, children, fields, shared }: FormImplProps<I, O>) => {
    const [form] = useForm<I>();
    const [input, setInput] = useState<I>();
    const [modelId, setModelId] = useState<string>();
    const exampleCtx = useContext(Examples);

    // If we're loading a shared URL, populate the form and submit it.
    useEffect(() => {
        if (shared) {
            // See if the input we're populating the form with is one of the examples.
            const ex = flattenExamples(exampleCtx.examples).find((e) => {
                const notEqual = Object.entries(shared).some(([k, v]) => {
                    return !(k in e) || v !== e[k];
                });
                return !notEqual;
            });
            exampleCtx.selectExample(ex);

            // See the note below about the cast.
            form.setFieldsValue(shared as any);
            submitForm(shared);
        }
    }, [shared]);

    // Change the input values when an example is selected.
    useEffect(() => {
        if (exampleCtx.selectedExample) {
            // The antd API wants a `RecursivePartial<I>` here, which I can't figure out how to
            // satisfy. What's interesting is the method only assigns values for properties whose
            // name matches that of a form field -- so `Partial<I>` should be ok.
            form.setFieldsValue(exampleCtx.selectedExample as any);
        }
    }, [exampleCtx.selectedExample]);

    const models = useContext(Models);
    const model = models.selectedModel;
    if (!model) {
        throw new NoSelectedModelError();
    }

    const history = useHistory();

    const submitForm = (i: I) => {
        // First clear the previously submitted input. This clears the current output that's
        // been presented to the user, and prevents a class of bugs where the stale output
        // was being rendered with new input (and potentially a new model).
        setInput(undefined);

        setModelId(model.id);
        setInput(i);
    };

    const { path } = useRouteMatch();
    const submitFormAndUpdateRoute = (i: I) => {
        submitForm(i);

        // If we're not looking at output that was produced form a shared URL, we don't need
        // to do anything. We accept that the browser history doesn't work for submissions by
        // default.
        if (!shared) {
            return;
        }

        // Otherwise remove the path parameters related to the shared URL so that the user
        // doesn't get confused and think that updated output they're about to see is also
        // associated with that URL.
        const newPath = path.replace(Share.Path, '');
        history.push(generatePath(newPath, { modelId: model.id }));
    };

    const doRequest = () =>
        fetch(action, {
            method: 'POST',
            body: JSON.stringify(input),
        }).then((r) => r.json());

    return (
        <>
            <AntForm<I>
                onFinish={submitFormAndUpdateRoute}
                form={form}
                layout="vertical"
                hideRequiredMark>
                {fields}
            </AntForm>
            {input && modelId === model.id ? (
                <>
                    <Divider />
                    <Promised promise={doRequest} deps={[action, input]}>
                        {(output) => children({ input, model, output })}
                    </Promised>
                </>
            ) : null}
        </>
    );
};

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
 * Here's an example:
 *
 * <Form<Input, Prediction>
 *     fields={
 *         <>
 *             <Question>
 *             <Passage>
 *         </>
 *     }>
 *     {({ input, model, output }) => (
 *         <Output>
 *             <Output.Section>
 *                 <h3>Returned Output</h3>
 *                 <code>{JSON.stringify(output, null, 2)}</code>
 *             </Output.Section>
 *         </Output>
 *     )}
 * </Form>
 */
export const Form = <I, O>({ action, children, fields, version }: Props<I, O>) => {
    return (
        <Share.Controller<I> type={version}>
            {(shared) => (
                <FormImpl action={action} fields={fields} shared={shared}>
                    {children}
                </FormImpl>
            )}
        </Share.Controller>
    );
};
