import { DemoConfig } from '../../tugboat/lib';
import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Open Information Extraction',
    order: 2,
    modelIds: [ModelId.OpenIE],
    status: 'hidden',
    taskId: 'oie',
};
