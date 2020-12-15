import { createContext } from 'react';

import { Model } from '../lib';

interface ModelList {
    models: Model[];
    selectedModel?: Model;
    selectModelById: (modelId: string) => void;
}

export const Models = createContext<ModelList>({ models: [], selectModelById: () => {} });
