import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Semantic Role Labeling',
    order: 6,
    modelIds: [ModelId.SemanticRollLabeling],
    status: 'active',
    taskId: 'srl',
};
