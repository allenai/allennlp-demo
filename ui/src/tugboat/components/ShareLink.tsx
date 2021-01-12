import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Space, Typography } from 'antd';

import { Promised } from './Promised';
import { emory } from '../lib';

interface Props<I extends {}> {
    app: string;
    input: I;
}

export const ShareLink = <I,>({ app, input }: Props<I>) => {
    const [hasClicked, setHasClicked] = useState(false);
    return (
        <Space size="middle">
            <ShareButton onClick={() => setHasClicked(true)}>Share</ShareButton>
            {hasClicked ? (
                <Promised fetch={() => emory.createDoc(app, input)} input={[app, input]}>
                    {({ output }) => (
                        <ShareURL>{`${document.location.toString()}${output}`}</ShareURL>
                    )}
                </Promised>
            ) : null}
        </Space>
    );
};

const ShareButton = styled(Button).attrs(() => ({ size: 'small' }))`
    ${({ theme }) => `
    font-size: ${theme.typography.textStyles.small.fontSize};
`}
`;

const ShareURL = styled(Typography.Text).attrs(() => ({ copyable: true }))`
    ${({ theme }) => `
    font-size: ${theme.typography.textStyles.small.fontSize};
    color: ${theme.color.B8};
`}
`;
