import React from 'react';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { notification, Space } from 'antd';

interface Props {
    modelIds: string[];
    children: React.ReactNode | JSX.Element;
}

/**
 * Handles URLs that use the former permalink syntax by redirecting the user and displaying
 * a non-invasive warning.
 *
 * The user is redirected to the current demo with the first model in the provided list
 * selected.
 */
export const RedirectLegacyPermalinks = ({ modelIds, children }: Props) => {
    //
    // The legacy permalink mechanism produces URLs that look like this:
    //
    //     https://demo.allennnlp.org/reading-comprehension/MTA1Mjc3NA==
    //
    // Where `MTA1Mjc3NA==` is a base64 encoded row id. For instance, in the above example
    // `MTA1Mjc3NA==` evalutes to `1052774`.
    //
    // The new demos use this portion of the URL path for the selected model identifier, for
    // instance:
    //
    //     https://demo.allennlp.org/reading-comprehension/bidaf
    //
    // So, to find legacy permalinks as to handle them in a UX friendly way we:
    //
    // 1. Check that the value isn't a valid model identifier.
    //
    // 2. Base64 decode the value. If it's a valid integer it's a legacy permalink, if it's
    //    not then it's something else.
    //
    const match = useRouteMatch<{ demo: string; maybeModelId: string }>('/:demo/:maybeModelId');
    if (!match) {
        return <>{children}</>;
    }

    // If it's a model that's associated with this demo, don't do anything.
    const { maybeModelId } = match.params;
    const validModelIds = new Set(modelIds);
    if (validModelIds.has(maybeModelId)) {
        return <>{children}</>;
    }

    // Base64 decode the value and convert it to an integer. If this doesn't work, then
    // it's neither a valid model id or a permalink, in which case we let the regular
    // mechanics of the application handle things.
    let decoded;
    try {
        decoded = parseInt(atob(maybeModelId));
    } catch {
        // Silence is golden here. We're just catching an exception that might be thrown
        // by `atob()`.
    }
    const isNotPermalink = decoded ? isNaN(decoded) : true;
    if (isNotPermalink) {
        return <>{children}</>;
    }

    // If we got this far it's a permalink. Do something nice UX wise.
    notification.warning({
        message: 'Legacy URL',
        description: (
            <Space direction="vertical">
                <span>Sorry, that URL doesn't work anymore.</span>
                <span>
                    If you arrived here by clicking a link on a website, please ask the webmaster to
                    update the URL.
                </span>
            </Space>
        ),
    });
    return <Redirect to={`/${match.params.demo}`} />;
};
