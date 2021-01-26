import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Generate a passage',
    title: 'Masked Language Modeling',
    path: '/masked-lm',
    order: 3,
    modelIds: [ModelId.MaskedLM],
    status: 'hidden',
    taskId: 'masked-language-modeling',
};
