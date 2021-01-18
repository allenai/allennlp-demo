import { DemoConfig } from '../../tugboat/lib';
import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Named Entity Recognition',
    order: 1,
    modelIds: [ModelId.ElmoNer, ModelId.FineGrainedNer],
    status: 'hidden',
    taskId: 'ner',
};
