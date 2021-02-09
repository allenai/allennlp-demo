import { emory } from '@allenai/tugboat/lib';

export const Version = emory.getVersion('sa-v1');

export interface Input {
    sentence: string;
    tokens: string[]; // tokens are used as the attack inpour prop
}

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
