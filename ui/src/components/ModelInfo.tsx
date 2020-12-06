import React from 'react';

import { AsyncOutput } from '../tugboat/components';

import { ModelInfo as MInfo, fetchModelInfo } from '../lib';

interface Props {
    /**
     * If set, only info for the specified models will be returned. If unset information for
     * all models will be returned.
     */
    ids?: string[];
    children: (info: MInfo[]) => React.ReactNode;
}

export const ModelInfo = ({ ids, children }: Props) => (
    <AsyncOutput<string[] | undefined, MInfo[]> input={ids} fn={fetchModelInfo}>
        {(output) => <>{children(output)}</>}
    </AsyncOutput>
);
