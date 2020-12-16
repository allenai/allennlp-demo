import React from 'react';

import { Form } from '../tugboat/components';

interface Props {
    children: React.ReactNode;
}

/**
 * Top level container for a demo that showcases a Model's predictor.
 */
export const Predict = <I, O>({ children }: Props) => (
    <Form<I, O> action={(modelId) => `/api/${modelId}/predict`}>{children}</Form>
);
