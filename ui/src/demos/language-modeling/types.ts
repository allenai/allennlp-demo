import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('ntlm-v1');

export interface Input {
    sentence: string;
}

export interface Prediction {
    probabilities: number[];
    token_ids: number[];
    tokens: string[];
    top_indices: number[][];
    top_tokens: string[][];
}
