import React from 'react';

import { Promised } from '../tugboat/components';

import { TaskCardsById, fetchTaskCards } from '../lib';

interface Props {
    children: (t: TaskCardsById) => React.ReactNode;
}

export const TaskCards = ({ children }: Props) => {
    return <Promised fetch={fetchTaskCards}>{(tasksById) => <>{children(tasksById)}</>}</Promised>;
};
