import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Generate a passage',
    title: 'Language Modeling',
    path: '/next-token-lm',
    order: 2,
    modelIds: [ModelId.NextTokenLM],
    status: 'active',
    taskId: 'language-modeling',
};
