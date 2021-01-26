import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('ner-v1');

export interface Input {
    sentence: string;
    text: string; // TODO: [jon] remove this
}

export interface WithTokenizedInput {
    words: string[][];
}

export const isWithTokenizedInput = (pred: any): pred is WithTokenizedInput => {
    const xx = pred as WithTokenizedInput;
    return Array.isArray(xx.words);
};

export interface Prediction extends WithTokenizedInput {
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
