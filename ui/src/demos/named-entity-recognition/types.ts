import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('ner-v1');

export interface Input {
    sentence: string;
}

export interface WithTokenizedInput {
    words: string[];
}

export const isWithTokenizedInput = (pred: any): pred is WithTokenizedInput => {
    const xx = pred as WithTokenizedInput;
    return Array.isArray(xx.words);
};

export interface Prediction extends WithTokenizedInput {
    mask: boolean[];
    tags: string[];
    logits: number[][];
}

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
    };
}
