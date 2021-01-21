import React, { useContext } from 'react';
import * as Sentry from '@sentry/react';
import { useRouteMatch } from 'react-router-dom';
import { notification } from 'antd';

import { emory, usePromise, PromiseState } from '../../lib';
import { Config } from '../../context';
import { Path as SharePath } from './Path';
import { Loading } from '../../components';

type View<T> = (shared?: T) => React.ReactNode | JSX.Element;

interface Props<T> {
    type?: string;
    children: View<T>;
}

/**
 * A component that provides access to a document referred to by the URL.
 *
 * If the browser URL matches the expected format for a shareable URL, this component
 * handles fetching the associated document and providing it to it's children. If the document
 * isn't found, or is of the incorrect type, or if the current URL isn't a shareable one, then
 * `undefined` is passed along instead.
 *
 * The component handles errors encountered while trying to fetch a shared document by displaying
 * a brief notification to the user. The notification goes away after a shared period.
 *
 * Here's an example of how this component might be used:
 *
 * <Share.Controller type="rc-bidaf-v1">{(shared) => (
 *     shared
 *          ? <span>A shared document was found!</span>
 *          : <span>No shared doc.</span>
 * )}</Share.Controller>
 */
export const Controller = <T,>({ type, children }: Props<T>) => {
    const { appId } = useContext(Config);

    const match = useRouteMatch<{ docId: string }>(`/:root+${SharePath}`);
    const docId = match?.params.docId;

    const [state, doc, err] = usePromise(() => {
        if (!docId) {
            return false;
        }
        return emory.getDocStrict<T>(docId, appId, type).then((e) => e.doc);
    }, [docId, appId, type]);

    if (!match) {
        return <>{children()}</>;
    }

    if (state === PromiseState.Loading) {
        return <Loading />;
    }

    if (state === PromiseState.Failure) {
        Sentry.captureException(err);
        console.error('Shared document failed to load:', err);
        notification.error({
            message: 'Something went wrong.',
            description:
                "Sorry, we couldn't load the data associated with this URL. Please try again.",
        });
    }

    return <>{children(doc)}</>;
};
