import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a passage',
    title: 'Coreference Resolution',
    order: 1,
    modelIds: [ModelId.CoreferenceResolution],
    status: 'active',
    taskId: 'coref',
};
