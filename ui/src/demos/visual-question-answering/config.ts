import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Answer a question',
    title: 'Visual Question Answering',
    order: 2,
    modelIds: [ModelId.ConstituencyParser], // TODO: [jon] this should be [ModelId.VilbertVQA] once the api is updated
    status: 'hidden',
    taskId: 'vqa',
};
