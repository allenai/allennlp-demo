import { DemoConfig } from '../../tugboat/lib';
import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Answer a question',
    title: 'Reading Comprehension',
    order: 1,
    modelIds: [
        ModelId.BidafElmo,
        ModelId.Bidaf,
        ModelId.Nmn,
        ModelId.TransformerQa,
        ModelId.Naqanet,
    ],
    status: 'hidden',
    taskId: 'rc',
};
