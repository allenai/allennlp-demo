import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { generatePath } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Space, Popover, notification, Typography } from 'antd';

import { emory, usePromise, PromiseState } from '../../lib';
import { Path as SharePath } from './Path';
import { Loading } from '../Loading';

export interface LinkProps<T extends {}> {
    app: string;
    type?: string;
    doc: T;
    slug: string;
}

/**
 * A component that renders a button that, when clicked, produces a URL that can be used
 * to resume the current state of the application.
 *
 * The resulting URL includes an identifier that can be used to retrieve the value of
 * `doc` at a future time. The `type` indicates what's being stored, and can include
 * versioning information that can be used downstream.
 *
 * The component requires that a URL safe slug be provided, which will be included in
 * the resulting URL. This is for the end-user -- as it ensures there URL has some intelligble
 * bits that can be used to infer things about where the URL might take someone.
 */
export const Link = <T,>({ app, type, doc, slug }: LinkProps<T>) => {
    const hasExistingShareURL = useRouteMatch(`/:root+${SharePath}`) !== null;

    const [hasBeenClicked, setHasBeenClicked] = useState(false);
    const [state, docId, err] = usePromise(() => {
        if (!hasBeenClicked || hasExistingShareURL) {
            return false;
        }
        return emory.createDoc({ app, type, doc });
    }, [hasBeenClicked, hasExistingShareURL, doc, app, doc]);

    const btn = <Button onClick={() => setHasBeenClicked(true)}>Share</Button>;

    // If we're already at a shareable URL, don't create a new one.
    if (hasExistingShareURL) {
        return (
            <Popover content={<URL>{document.location.toString()}</URL>} placement="left">
                {btn}
            </Popover>
        );
    }

    // We don't create the shareable URL until they click the share button. This prevents us
    // from leaving a bunch of unused crunch in the db.
    if (!hasBeenClicked) {
        return btn;
    }

    if (state === PromiseState.Loading) {
        return (
            <Space>
                <Loading />
                {btn}
            </Space>
        );
    }

    // If something goes wrong we show a non-intrusive message that goes away after a short
    // period. We want the user to still be able to use the application, even though we couldn't
    // load what they're trying to view.
    if (state === PromiseState.Failure || !docId) {
        console.error('Failed to create shareable link:', err);
        Sentry.captureException(err);
        notification.warning({
            message: 'Something went Wrong',
            description:
                'An error occured which prevented us from creating a shareable URL. ' +
                'Please try again.',
        });
        return btn;
    }

    const url =
        location.origin +
        location.pathname.replace(/\/+$/, '') +
        generatePath(SharePath, { slug, docId });
    return (
        <Popover content={<URL>{url}</URL>} placement="left" defaultVisible>
            {btn}
        </Popover>
    );
};

export const ShareButton = <I,>(props: LinkProps<I>) => (
    <AlignRight>
        <Link {...props} />
    </AlignRight>
);

const URL = styled(Typography.Text).attrs(() => ({ copyable: true }))`
    ${({ theme }) => `
        font-size: ${theme.typography.textStyles.small.fontSize};
        font-weight: ${theme.typography.font.weight.bold};
    `}
`;

const AlignRight = styled.span`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;
