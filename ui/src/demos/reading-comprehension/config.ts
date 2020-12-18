import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Answer a question',
    title: 'Reading Comprehension',
    order: 1,
    modelIds: ['bidaf-elmo', 'bidaf', 'nmn', 'transformer-qa', 'naqanet'],
    status: 'hidden',
    taskId: 'rc',
};
