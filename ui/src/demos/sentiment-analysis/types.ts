import { emory } from '../../tugboat/lib';

export const Version = emory.getVersion('sa-v1');

export interface Input {
    sentence: string;
}

export interface WithTokenizedInput {
    words: string[][];
}

export const isWithTokenizedInput = (pred: any): pred is WithTokenizedInput => {
    const xx = pred as WithTokenizedInput;
    return Array.isArray(xx.words);
};

export interface Prediction {
    probs: number[];
	logits: number[];
	token_ids: number[];
	tokens: string[];
	label: string;
}

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
    };
}
