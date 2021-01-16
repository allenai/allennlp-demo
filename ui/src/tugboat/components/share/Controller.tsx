import React, { useContext } from 'react';
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
        console.error('Shared document failed to load:', err);
        notification.error({
            message: 'Something went wrong.',
            description:
                "Sorry, we couldn't load the data associated with this URL. Please try again.",
        });
    }

    return <>{children(doc)}</>;
};
