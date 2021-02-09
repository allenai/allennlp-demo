import { DemoConfig } from '@allenai/tugboat/lib';

import { ModelId } from '../../lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Sentiment Analysis',
    order: 3,
    modelIds: [ModelId.GloveSentimentAnalysis, ModelId.RobertaSentimentAnalysis],
    status: 'active',
    taskId: 'sentiment-analysis',
};
