import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Generate a passage',
    title: 'Language Modeling',
    path: '/next-token-lm',
    order: 2,
    modelIds: [ModelId.NextTokenLM],
    status: 'active',
    taskId: 'language-modeling',
};
