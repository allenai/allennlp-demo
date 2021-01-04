export interface WithTokenizedInput {
    passage_tokens: string[];
    question_tokens: string[];
}

export const isWithTokenizedInput = (x: any): x is WithTokenizedInput => {
    const xx = x as WithTokenizedInput;
    return Array.isArray(xx.passage_tokens) && Array.isArray(xx.question_tokens);
};
