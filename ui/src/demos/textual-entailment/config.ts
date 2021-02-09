import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Compare two sentences',
    title: 'Textual Entailment',
    order: 1,
    modelIds: [ModelId.ELMOSNLI, ModelId.RobertaSNLI, ModelId.RobertaMNLI],
    status: 'active',
    taskId: 'textual_entailment',
};
