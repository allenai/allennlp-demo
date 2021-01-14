import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Popover, Typography } from 'antd';

import { emory, usePromise } from '../lib';

// TODO: When we create @allenai/tugboat, this dependency should be remove from the AllenNLP
// demo's dependencies.
import slug from 'slug';

function makeURL({ docId, slug }: { docId: string, slug?: string }) {
    // TODO: For use outside of the AllenNLP Demo we might need to make this more flexible,
    // as applications will probably want to change the final URL.
    const origin = document.location.origin;
    const path = document.location.pathname.replace(/\/$/, '')
    if (!slug) {
        return `${origin}${path}/s/${docId}`;
    }
    return `${origin}${path}/s/${slug}/${docId}`;
}

interface Props<I extends {}> {
    app: string;
    type?: string;
    input: I;
    slug?: string;
}

export const ShareLink = <I,>({ app, type, input, slug }: Props<I>) => {
    const [hasBeenClicked, setHasBeenClicked] = useState(false);
    const disableFetch = !hasBeenClicked;
    const state = usePromise(
        () => emory.createDoc({ app, type, doc: input }),
        input,
        disableFetch
    );

    const btn = (
        <Button
            onClick={() => setHasBeenClicked(true)}
            loading={state.isLoading()}>Share</Button>
    );

    if (state.isUnitialized() || state.isLoading()) {
        return btn;
    }

    if (!state.isSuccess()) {
        // TODO
        return <>Error</>;
    }

    const docId = state.output;
    const url = makeURL({ docId, slug });

    return (
        <Popover content={<ShareURL>{url}</ShareURL>} placement="left" defaultVisible>
            {btn}
        </Popover>
    );
};

/**
 * Removes non-word characters and shortens the provided string to include up to `max` words.
 */
function shorten(s: string, max: number) {
    const words = s.replace(/[^\w\s]/g ,'').split(/\s+/);
    if (words.length <= max) {
        return words.join(' ');
    }
    const selected = words.slice(0, max - 1).concat(words.reverse().slice(0, 1));
    return selected.join(' ');
}

/**
 * Produces a URL safe slug from the provided string. By default the slug's length is limited to
 * 5 words, if you'd like a slug without a limit set `maxWords` to `Infinity`.
 */
ShareLink.slug = (s: string, maxWords: number = 5) => {
    if (maxWords === Infinity) {
        return slug(s);
    }
    return slug(shorten(s, maxWords));
}

const ShareURL = styled(Typography.Text).attrs(() => ({ copyable: true }))`
    ${({ theme }) => `
        font-size: ${theme.typography.textStyles.small.fontSize};
        font-weight: ${theme.typography.font.weight.bold};
    `}
`;
