import { createContext } from 'react';

import { Task } from '../lib';

export const CurrentTask = createContext<{ task?: Task }>({});
