import React, { useContext, useState } from 'react';
import { Model, Task, Example } from '@allenai/tugboat/lib';
import { TaskDemo as TBTaskDemo, Promised } from '@allenai/tugboat/components';

import { AppId } from '../AppId';
import { fetchModelInfo, TaskCard, getModelCardId, ModelInfo } from '../lib';
import { ModelCards, ModelInfoList, TaskCards } from '../context';
import { RedirectLegacyPermalinks } from '../components';

class ModelCardNotFoundError extends Error {
    constructor(info: ModelInfo) {
        super(`No model card found for model ${info.id}.`);
    }
}

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

interface Props {
    ids: string[];
    taskId: string;
    children: React.ReactNode;
    examples?: Example[];
}

/**
 * An AllenNLP demo for a particular task.
 *
 * This component exists primarily to handle the process of converting AllenNLP's specific notion
 * of a model (which is queried via API routes) to the shape expected by the tugboat module.
 */
export const TaskDemo = ({ ids, taskId, children, examples }: Props) => {
    const fetchInfoForIncludedModels = () => Promise.all(ids.map(fetchModelInfo));
    return (
        <Promised promise={fetchInfoForIncludedModels} deps={ids}>{
            (infos) => {
                const tasksById = useContext(TaskCards);
                if (!(taskId in tasksById)) {
                    throw new TaskNotFoundError(taskId);
                }
                const task = tasksById[taskId];

                const cardsById = useContext(ModelCards);
                const models: Model[] = [];
                for (const info of infos) {
                    const modelCardId = getModelCardId(info);
                    if (!(modelCardId in cardsById)) {
                        throw new ModelCardNotFoundError(info);
                    }
                    models.push(new Model(info.id, cardsById[modelCardId]));
                }
                return (
                    <ModelInfoList.Provider value={infos}>
                        <RedirectLegacyPermalinks modelIds={ids}>
                            <TBTaskDemo
                                models={models}
                                task={asTugBoatTask(task)}
                                appId={AppId}
                                examples={examples}>
                                {children}
                            </TBTaskDemo>
                        </RedirectLegacyPermalinks>
                    </ModelInfoList.Provider>
                );

            }
        }</Promised>
    );
};
