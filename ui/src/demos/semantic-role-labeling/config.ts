import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Semantic Role Labeling',
    order: 6,
    modelIds: [ModelId.SemanticRollLabeling],
    status: 'hidden',
    taskId: 'srl',
};
