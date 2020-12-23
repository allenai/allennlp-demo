import React from 'react';
import { Input } from 'antd';

import { Form, Field, Fields, Output, Result, Submit } from '../tugboat/components';

interface Props<I, O> {
    input: I;
    interpreter: string;
    children: (interpretation: Result<I, O>) => React.ReactNode | JSX.Element;
}

export const Interpret = <I extends { [k: string]: any }, O>({
    interpreter,
    input,
    children,
}: Props<I, O>) => (
    <Form<I, O> action={(modelId) => `/api/${modelId}/interpret/${interpreter}`}>
        <Fields>
            {Object.keys(input).map((fieldName) => (
                <Field key={fieldName} name={fieldName} hidden>
                    <Input value={input[fieldName]} />
                </Field>
            ))}
            <Submit>Interpret Prediction</Submit>
        </Fields>
        <Output>{children}</Output>
    </Form>
);
