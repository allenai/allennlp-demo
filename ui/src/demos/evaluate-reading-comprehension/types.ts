import { emory } from '@allenai/tugboat/lib';
// import {isWithTokenizedInput} from "../evaluate-reading-comprehension/types";

export const Version = emory.getVersion('sa-v1');

export interface Input {
    context: string;
    question: string;
    reference: string;
    candidate: string;
}

export interface Prediction {
    pred_score: number
}