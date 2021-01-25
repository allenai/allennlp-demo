import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Compare two sentences',
    title: 'Textual Entailment',
    order: 1,
    modelIds: [ModelId.ELMOSNLI, ModelId.RobertaSNLI, ModelId.RobertaMNLI],
    status: 'hidden',
    taskId: 'textual_entailment',
};
