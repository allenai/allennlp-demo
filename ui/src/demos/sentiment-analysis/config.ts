import { ModelId } from '../../lib';
import { DemoConfig } from '../../tugboat/lib';

export const config: DemoConfig = {
    group: 'Annotate a sentence',
    title: 'Sentiment Analysis',
    order: 3,
    modelIds: [ModelId.GloveSentimentAnalysis, ModelId.RobertaSentimentAnalysis],
    status: 'active',
    taskId: 'sentiment-analysis',
};
