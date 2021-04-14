import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Compare two sentences',
    title: 'Evaluate Reading Comprehension',
    order: 2,
    modelIds: [ModelId.LERC],
    status: 'active',
    taskId: 'evaluate_rc',
};
