import React from 'react';

import { AsyncOutput } from '../tugboat/components';

import { ModelInfo as MInfo, fetchModelInfo } from '../lib';

interface Props {
    /**
     * The ids of the models to return info for. If not set information is returned for
     * all models.
     */
    ids?: string[];
    children: (info: MInfo[]) => React.ReactNode;
}

export const ModelInfo = ({ ids, children }: Props) => (
    <AsyncOutput<string[] | undefined, MInfo[]> input={ids} fetch={fetchModelInfo}>
        {(output) => <>{children(output)}</>}
    </AsyncOutput>
);
