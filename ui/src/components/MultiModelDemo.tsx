import React from 'react';

import { Model, ModelCard, Task } from '../tugboat/lib';
import { Promised, MultiModelDemo as TBMultiModelDemo } from '../tugboat/components';

import { AppId } from '../AppId';
import { TaskCards } from './TaskCards';
import { TaskCard, fetchModelInfo, fetchModelCard, ModelInfo } from '../lib';
import { ModelInfoList } from '../context';

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

interface ModelInfoAndCard {
    info: ModelInfo;
    card: ModelCard;
}

function fetchAllModelInfoAndCard(ids?: string[]): Promise<ModelInfoAndCard[]> {
    return fetchModelInfo(ids).then((info) => {
        const cards: Promise<ModelInfoAndCard>[] = [];
        for (const i of info) {
            cards.push(NMNchModelCard(i).then((c) => ({ card: c, info: i })));
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
    <Promised promise={() => fetchAllModelInfoAndCard(ids)} deps={[ids]}>
        {(modelInfoAndCards) => {
            const models: Model[] = [];
            const allModelInfo: ModelInfo[] = [];
            for (const { info, card } of modelInfoAndCards) {
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
                                <TBMultiModelDemo
                                    models={models}
                                    task={asTugBoatTask(task)}
                                    appId={AppId}>
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
