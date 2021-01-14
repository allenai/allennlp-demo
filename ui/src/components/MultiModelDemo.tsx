import React from 'react';

import { TaskCards } from './TaskCards';
import { TaskCard, fetchModelInfo, fetchModelCard, ModelInfo, ModelId } from '../lib';
import { Model, ModelCard, Task } from '../tugboat/lib';
import { ModelInfoList } from '../context';
import { Promised, MultiModelDemo as TBMultiModelDemo } from '../tugboat/components';

class TaskNotFoundError extends Error {
    constructor(taskId: string) {
        super(`Task ${taskId} not found.`);
    }
}

/**
 * Converts an AllenNLP Task to a TugBoat one. Ultimately this just replaces a few things
 * that can be missing with default values, since AllenNLP allows things to be undefined
 * that TugBoat doesn't.
 */
function asTugBoatTask(card: TaskCard): Task {
    return {
        name: 'Unknown',
        description: 'Unknown',
        ...card,
    };
}

/**
 * HACK: This is a temporary hack, that maps models without a `pretained_model_id` to the correct
 * value to use instead.
 *
 * We need to transition the model endpoints so that their `id` field includes the task, i.e.
 * `/api/bidaf` should be `/api/rc-bidaf`, or `/api/rc/bidaf`. This is going to take enough
 * time that it makes sense to put this temporary measure in place to unblock the UI.
 */
function getFallbackPretrainedModelId(id: ModelId): string | undefined {
    if (id === ModelId.Nmn) {
        return 'rc-nmn';
    }
}

interface ModelInfoAndCard {
    info: ModelInfo;
    card: ModelCard;
}

function fetchAllModelInfoAndCard(ids?: string[]): Promise<ModelInfoAndCard[]> {
    return fetchModelInfo(ids).then((info) => {
        const cards: Promise<ModelInfoAndCard>[] = [];
        for (const i of info) {
            const pretrainedModelId = i.pretrained_model_id ?? getFallbackPretrainedModelId(i.id);
            if (!pretrainedModelId) {
                console.warn(
                    `Model ${i.id} doesn't have a pretrained_model_id, so it won't be included.`
                );
                continue;
            }
            // TODO (@codeviking): Right now this API is really slow. We need to make it
            // faster.
            cards.push(fetchModelCard(pretrainedModelId).then((c) => ({ card: c, info: i })));
        }
        return Promise.all(cards);
    });
}

interface Props {
    ids: string[];
    taskId: string;
    children: React.ReactNode;
}

/**
 * An AllenNLP demo featuring multiple models, one of which can be selected at a time.
 *
 * This component exists primarily to handle the process of converting AllenNLP's specific notion
 * of a model (which is queried via API routes) to the shape expected by the tugboat package.
 */
export const MultiModelDemo = ({ ids, taskId, children }: Props) => (
    <Promised input={ids} fetch={fetchAllModelInfoAndCard}>
        {({ output }) => {
            const models: Model[] = [];
            const allModelInfo: ModelInfo[] = [];
            for (const { info, card } of output) {
                models.push(new Model(info.id, card));
                allModelInfo.push(info);
            }
            return (
                <ModelInfoList.Provider value={allModelInfo}>
                    <TaskCards>
                        {(tasksById) => {
                            if (!(taskId in tasksById)) {
                                throw new TaskNotFoundError(taskId);
                            }
                            const task = tasksById[taskId];
                            return (
                                <TBMultiModelDemo models={models} task={asTugBoatTask(task)}>
                                    {children}
                                </TBMultiModelDemo>
                            );
                        }}
                    </TaskCards>
                </ModelInfoList.Provider>
            );
        }}
    </Promised>
);
