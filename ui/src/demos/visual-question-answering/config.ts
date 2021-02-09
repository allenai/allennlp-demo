import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Answer a question',
    title: 'Visual Question Answering',
    order: 2,
    modelIds: [ModelId.VilbertVQA],
    status: 'active',
    taskId: 'vqa',
};
