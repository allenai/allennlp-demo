import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('te-v1');

export interface Input {
    premise: string;
    hypothesis: string;
}

export interface WithTokenizedInput {
    tokens: string[];
}

export const isWithTokenizedInput = (pred: any): pred is WithTokenizedInput => {
    const xx = pred as WithTokenizedInput;
    return Array.isArray(xx.tokens);
};

export interface ElmoPrediction {
    label_logits: number[];
    label_probs: number[];
}

export const isElmoPrediction = (pred: Prediction): pred is ElmoPrediction => {
    const typedPred = pred as ElmoPrediction;
    return typedPred.label_logits !== undefined && typedPred.label_probs !== undefined;
};

export interface RobertaPrediction extends WithTokenizedInput {
    label: string;
    logits: number[];
    probs: number[];
    token_ids: number[];
}

export const isRobertaPrediction = (pred: Prediction): pred is RobertaPrediction => {
    const typedPred = pred as RobertaPrediction;
    return (
        isWithTokenizedInput(typedPred) &&
        typedPred.label !== undefined &&
        typedPred.logits !== undefined &&
        typedPred.probs !== undefined &&
        typedPred.token_ids !== undefined
    );
};

export type Prediction = ElmoPrediction | RobertaPrediction;

export const isPrediction = (pred: Prediction): pred is Prediction => {
    const typedPred = pred as Prediction;
    return isElmoPrediction(typedPred) || isRobertaPrediction(typedPred);
};

export interface InterpreterData {
    instance_1: {
        grad_input_1: number[];
        grad_input_2: number[];
    };
}
