import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('ner-v1');

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

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
    };
}
