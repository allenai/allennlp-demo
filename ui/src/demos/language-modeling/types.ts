import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('ntlm-v1');

export interface Input {
    sentence: string;
    text: string; // TODO: [jon] remove once backend is fixed
}

export interface Prediction {
    probabilities: number[];
    token_ids: number[];
    tokens: string[];
    top_indices: number[][];
    top_tokens: string[][];
}
