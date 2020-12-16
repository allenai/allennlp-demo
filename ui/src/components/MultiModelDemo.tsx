import React from 'react';

import { ModelInfo } from './ModelInfo';
import * as tugboat from '../tugboat';

interface Props {
    ids: string[];
    children: React.ReactNode;
}

/**
 * An AllenNLP demo featuring multiple models, one of which can be selected at a time.
 *
 * This component exists primarily to handle the process of converting AllenNLP's specific notion
 * of a model (which is queried via API routes) to the shape expected by the tugboat package.
 */
export const MultiModelDemo = ({ ids, children }: Props) => (
    <ModelInfo ids={ids}>
        {(info) => {
            const models = [];
            for (const i of info) {
                if (!i.model_card_data) {
                    console.warn(
                        `Model ${i.id} won't be displayed because it doesn't have a model card.`
                    );
                    continue;
                }
                models.push(new tugboat.lib.Model(i.id, i.model_card_data));
            }
            return (
                <tugboat.components.MultiModelDemo models={models}>
                    {children}
                </tugboat.components.MultiModelDemo>
            );
        }}
    </ModelInfo>
);
