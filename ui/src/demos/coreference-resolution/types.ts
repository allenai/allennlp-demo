import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('cr-v1');

export interface Input {
    document: string;
}

export interface Prediction {
    antecedent_indices: number[][];
    clusters: number[][][];
    document: string[];
    predicted_antecedents: number[];
    top_spans: number[][];
}
