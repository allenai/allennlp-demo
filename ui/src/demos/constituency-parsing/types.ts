import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('cp-v1');

export interface Input {
    sentence: string;
}

export interface Prediction {
    class_probabilities: number[][];
    hierplane_tree: {}; // TODO: we will remove soon
    num_spans: number;
    pos_tags: string[];
    spans: number[][];
    tokens: string[];
    trees: string;
}
