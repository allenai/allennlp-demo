import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Named Entity Recognition',
    order: 1,
    modelIds: ['named-entity-recognition', 'fine-grained-ner'],
    status: 'hidden',
    taskId: 'ner',
};
