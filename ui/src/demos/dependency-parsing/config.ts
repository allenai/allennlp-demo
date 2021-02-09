import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Dependency Parsing',
    order: 4,
    modelIds: [ModelId.DependencyParser],
    status: 'active',
    taskId: 'dependency-parsing',
};
