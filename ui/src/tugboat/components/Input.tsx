import React from 'react';

import * as form from './form';

interface Props {
    children: React.ReactNode;
}

export const Input = ({ children }: Props) => {
    return <form.Form>{children}</form.Form>;
};
