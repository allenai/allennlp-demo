import React from 'react';

interface Props {
    children: React.ReactNode;
}

/**
 * A component that is is meant to be the child of a Form component. It's children should be a
 * a series of fields for capturing user input.
 */
export const Fields = ({ children }: Props) => <>{children}</>;
