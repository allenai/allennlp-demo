import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('mlm-v1');

export interface Input {
    sentence: string;
}

export interface Prediction {
    words: string[][];
    probabilities: number[][];
    token_ids: number[];
    tokens: string[];
    top_indices: number[][];
}
