import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('ner-v1');

export interface Input {
    sentence: string;
}

export interface Prediction {
    words: string[];
    mask: boolean[];
    tags: string[];
    logits: number[][];
}
