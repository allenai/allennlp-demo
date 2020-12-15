import React from 'react';
import { Divider } from 'antd';

import { Models } from '../../context';
import { NoSelectedModel } from '../../error';
import { Promised } from '../Promised';
import { FormElement } from './controls';

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
 * The `<Form />` copmonent expects exactly two children. The first child must be a `<Fields />`
 * component. The inputs that you want the user to provides hould be rendered as children of that
 * element. The second child must be a `<Output />` component. It's children should display the
 * output to the user.
 *
 * @example
 *  <Form>
 *      <Fields>
 *          <Passage>
 *          <Question>
 *      </Fields>
 *      <Output>{ (prediction) => (
 *          <b>The model's answer was: "${prediction.best_span}".</b>
 *      ) }</Output>
 *  </Form>
 */
export const Form = <I, O>(props: Props) => {
    const [input, setInput] = React.useState<I>();

    const models = React.useContext(Models);
    const fetchPredictions = (i: I) => {
        if (!models.selectedModel) {
            throw new NoSelectedModel();
        }
        const url = props.action(models.selectedModel.id);
        return fetch(url, { method: 'POST', body: JSON.stringify(i) }).then((r) => r.json());
    };

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
            <FormElement
                onFinish={(i) => {
                    setInput(i as I);
                }}>
                {firstChild}
            </FormElement>
            <Divider />
            {input ? (
                <Promised<I, O> input={input} fetch={fetchPredictions}>
                    {(output: O) => React.cloneElement(secondChild, { output })}
                </Promised>
            ) : null}
        </>
    );
};
