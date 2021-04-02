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
//
// export interface Input {
//     premise: string;
//     hypothesis: string;
// }
//
// export interface WithTokenizedInput {
//     tokens: string[];
// }
//
// export interface ElmoPrediction {
//     label_logits: number[];
//     label_probs: number[];
// }
//
// export const isElmoPrediction = (pred: Prediction): pred is ElmoPrediction => {
//     const typedPred = pred as ElmoPrediction;
//     return typedPred.label_logits !== undefined && typedPred.label_probs !== undefined;
// };
//
// export interface RobertaPrediction extends WithTokenizedInput {
//     label: string;
//     logits: number[];
//     probs: number[];
//     token_ids: number[];
// }
//
// export const isRobertaPrediction = (pred: Prediction): pred is RobertaPrediction => {
//     const typedPred = pred as RobertaPrediction;
//     return (
//         isWithTokenizedInput(typedPred) &&
//         typedPred.label !== undefined &&
//         typedPred.logits !== undefined &&
//         typedPred.probs !== undefined &&
//         typedPred.token_ids !== undefined
//     );
// };
//
// export type Prediction = ElmoPrediction | RobertaPrediction;