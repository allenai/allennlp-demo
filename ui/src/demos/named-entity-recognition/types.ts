export interface Input {
    sentence: string;
}

export interface WithTokenizedInput {
    words: string[];
}

export const isWithTokenizedInput = (x: any): x is WithTokenizedInput => {
    const xx = x as WithTokenizedInput;
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
