import React from 'react';
import { Divider, Form as AntForm } from 'antd';

import { Models, Examples } from '../../context';
import { NoSelectedModel } from '../../error';
import { Promised } from '../Promised';

class EmptyFormError extends Error {
    constructor() {
        super(
            'The form was submitted while empty. This is indicative of a programming error and ' +
                'should not happen'
        );
    }
}

class InvalidPredictChildrenError extends Error {
    constructor() {
        super(
            'The <Predict /> element expects exactly 2 children. The first must be a ' +
                '<PredictInput /> and the second must be a <PredictOutput />.'
        );
    }
}

interface Props {
    action: (modelId: string) => string;
    children: React.ReactNode;
}

/**
 * A component for rendering a form that the user should complete, and the output that's returned
 * when the user submits the data they entered in.
 *
 * The `<Form />` compoonent expects exactly two children. The first child must be a `<Fields />`
 * component. The inputs that you want the user to provide should be rendered as children of that
 * element. The second child must be a `<Output />` component. It's children should display the
 * output to the user. It'll receive two props at render time, `output`, the returned results,
 * and `input`, what was submitted.
 *
 * @example
 *  <Form>
 *      <Fields>
 *          <Passage>
 *          <Question>
 *      </Fields>
 *      <Output>{ (prediction, input) => (
 *          <b>The model's answer was: "${prediction.best_span}".</b>
 *      ) }</Output>
 *  </Form>
 */
export const Form = <I, O>(props: Props) => {
    const [input, setInput] = React.useState<I>();
    const [form] = AntForm.useForm<I>();

    const models = React.useContext(Models);
    const fetchPredictions = (i?: I) => {
        if (!i) {
            throw new EmptyFormError();
        }
        if (!models.selectedModel) {
            throw new NoSelectedModel();
        }
        const url = props.action(models.selectedModel.id);
        const opt = { method: 'POST', body: JSON.stringify(i) };
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
        }
    }, [examples.selectedExample]);

    // We do our best to make sure the children match the format we expect. That said we can't
    // actually make sure that they're the specific compoent type's we expect -- or at least, I
    // wasn't able to figure out how to do that.
    const children = React.Children.toArray(props.children);
    if (!children || children.length !== 2) {
        throw new InvalidPredictChildrenError();
    }
    const [firstChild, secondChild] = React.Children.toArray(children);
    if (!React.isValidElement(firstChild)) {
        throw new InvalidPredictChildrenError();
    }
    if (!React.isValidElement(secondChild)) {
        throw new InvalidPredictChildrenError();
    }

    return (
        <>
            <AntForm<I>
                layout="vertical"
                hideRequiredMark
                onFinish={(v) => setInput(v)}
                form={form}>
                {firstChild}
            </AntForm>
            <Divider />
            {input ? (
                <Promised<I, O> input={input} fetch={fetchPredictions}>
                    {(output: O, input: I) => React.cloneElement(secondChild, { output, input })}
                </Promised>
            ) : null}
        </>
    );
};
