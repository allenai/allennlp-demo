import { emory } from '../../tugboat/lib';

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

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
    };
}
