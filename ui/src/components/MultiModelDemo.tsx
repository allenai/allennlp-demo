import React from 'react';

import { TaskCards } from './TaskCards';
import { TaskCard, fetchModelInfo } from '../lib';
import { Model, Task } from '../tugboat/lib';
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
    <Promised input={ids} fetch={fetchModelInfo}>
        {({ output: info }) => {
            const models: Model[] = [];
            for (const i of info) {
                if (!i.model_card_data) {
                    console.warn(
                        `Model ${i.id} won't be displayed because it doesn't have a model card.`
                    );
                    continue;
                }
                models.push(new Model(i.id, i.model_card_data));
            }
            return (
                <ModelInfoList.Provider value={info}>
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
