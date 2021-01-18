/**
 * If a backwards incompatible change is made to the input or output, you can invalidate
 * all previously shared links (and the data associated with them) by changing the value
 * of Version below.
 *
 * A unique version is used in non-production environments to segment this data from data
 * produced by actual users.
 */
const isProduction = process.env.NODE_ENV === 'production';
const envSuffix = !isProduction ? '-dev' : '';
export const Version = 'ner-v1' + envSuffix; // TODO: [jon] move this?

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
