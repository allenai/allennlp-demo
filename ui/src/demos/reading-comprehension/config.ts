import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Answer a question',
    title: 'Reading Comprehension',
    order: 1,
    modelIds: [
        ModelId.BidafELMO,
        ModelId.Bidaf,
        ModelId.NMN,
        ModelId.TransformerQA,
        ModelId.Naqanet,
    ],
    status: 'active',
    taskId: 'rc',
};
