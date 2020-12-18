import React from 'react';

import { Promised } from '../tugboat/components';

import { TaskCardsById, fetchTaskCards } from '../lib';

interface Props {
    children: (t: TaskCardsById) => React.ReactNode;
}

export const TaskCards = ({ children }: Props) => (
    <Promised fetch={fetchTaskCards}>
        {({ output: tasksById }) => <>{children(tasksById)}</>}
    </Promised>
);
