import { createContext } from 'react';

import { GroupedExamples, Example } from '../lib';

interface ExampleList {
    examples: GroupedExamples | Example[];
    selectedExample?: Example;
    selectExample: (example: Example) => void;
}

export const Examples = createContext<ExampleList>({ examples: {}, selectExample: () => {} });
