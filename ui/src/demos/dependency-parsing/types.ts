import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('dp-v1');

export interface Input {
    sentence: string;
}

export interface Prediction {
    arc_loss: number;
    hierplane_tree: {}; // TODO: we will remove soon
    loss: number;
    pos: string[];
    predicted_dependencies: string[];
    predicted_heads: number[];
    tag_loss: number;
    words: string[];
}
