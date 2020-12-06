import React from 'react';

interface Props {
    children: React.ReactNode;
}

/**
 * The <Fields /> component is meant to be the child of a `<Form />` component. It's children should
 * be a series of fields that you'd like the user to enter.
 */
export const Fields = ({ children }: Props) => <>{children}</>;
