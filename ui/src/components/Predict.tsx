import React from 'react';

import { Form, ModelSuccessRenderer } from '../tugboat/components';

interface Props<I, O> {
    fields: React.ReactNode | JSX.Element;
    children: ModelSuccessRenderer<I, O>;
}

/**
 * Top level container for a demo that showcases a Model's predictor.
 */
export const Predict = <I, O>({ fields, children }: Props<I, O>) => (
    <Form<I, O> fields={fields} action={(modelId) => `/api/${modelId}/predict`}>
        {children}
    </Form>
);
