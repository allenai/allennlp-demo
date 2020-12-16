import React from 'react';
import styled from 'styled-components';

import { CurrentTask } from '../context';

/**
 * A component that displays the current task name prominently.
 */
export const TaskTitle = () => {
    const current = React.useContext(CurrentTask);
    if (!current.task) {
        return null;
    }
    return <Title>{current.task.name}</Title>;
};

const Title = styled.h3`
    margin-top: 0;
`;
