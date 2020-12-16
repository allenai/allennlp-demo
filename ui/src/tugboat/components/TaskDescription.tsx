import React from 'react';

import { CurrentTask } from '../context';

/**
 * A component that displays the description of the current task.
 */
export const TaskDescription = () => {
    const current = React.useContext(CurrentTask);
    if (!current.task) {
        return null;
    }
    return <p>{current.task.description}</p>;
};
