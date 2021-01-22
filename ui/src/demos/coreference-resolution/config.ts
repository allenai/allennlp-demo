import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Annotate a passage',
    title: 'Coreference Resolution',
    order: 1,
    modelIds: [ModelId.CoreferenceResolution],
    status: 'hidden',
    taskId: 'coref',
};
