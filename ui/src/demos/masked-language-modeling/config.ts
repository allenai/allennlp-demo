import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Generate a passage',
    title: 'Masked Language Modeling',
    path: '/masked-lm',
    order: 3,
    modelIds: [ModelId.MaskedLM],
    status: 'active',
    taskId: 'masked-language-modeling',
};
