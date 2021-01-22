import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Constituency Parsing',
    order: 5,
    modelIds: [ModelId.ConstituencyParser],
    status: 'active',
    taskId: 'constituency-parsing',
};
