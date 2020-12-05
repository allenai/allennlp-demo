import React from 'react';

interface Props<R> {
    response: R;
    children: (response: R) => React.ReactNode;
}

export const Output = <R,>({ children, response }: Props<R>) => children(response);
