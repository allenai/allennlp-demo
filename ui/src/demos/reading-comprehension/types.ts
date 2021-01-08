import { WithTokenizedInput, isWithTokenizedInput } from '../../lib';
import { InvalidModelResponseError } from '../../tugboat/error';

export interface Input {
    passage: string;
    question: string;
}

export interface BiDAFPrediction extends WithTokenizedInput {
    best_span: number[];
    best_span_str: string;
    passage_question_attention: number[][];
    span_end_logits: number[];
    span_end_probs: number[];
    span_start_logits: number[];
    span_start_probs: number[];
    token_offsets: number[][];
}

export const isBiDAFPrediction = (pred: Prediction): pred is BiDAFPrediction => {
    const typedPred = pred as BiDAFPrediction;
    return (
        isWithTokenizedInput(pred) &&
        typedPred.best_span !== undefined &&
        typedPred.best_span_str !== undefined &&
        typedPred.passage_question_attention !== undefined &&
        typedPred.span_end_logits !== undefined &&
        typedPred.span_end_probs !== undefined &&
        typedPred.span_start_logits !== undefined &&
        typedPred.span_start_probs !== undefined &&
        typedPred.token_offsets !== undefined
    );
};

export interface TransformerQAPrediction {
    best_span: number[];
    best_span_scores: number;
    best_span_str: string;
    context_tokens: string[];
    id: string;
    span_end_logits: number[];
    span_start_logits: number[];
}

export const isTransformerQAPrediction = (pred: Prediction): pred is TransformerQAPrediction => {
    const typedPred = pred as TransformerQAPrediction;
    return (
        typedPred.best_span !== undefined &&
        typedPred.best_span_scores !== undefined &&
        typedPred.best_span_str !== undefined &&
        typedPred.context_tokens !== undefined &&
        typedPred.id !== undefined &&
        typedPred.span_end_logits !== undefined &&
        typedPred.span_start_logits !== undefined
    );
};

export enum NAQANetAnswerType {
    PassageSpan = 'passage_span',
    QuestionSpan = 'question_span',
    Count = 'count',
    Arithmetic = 'arithmetic',
}

export interface NAQANetPrediction extends WithTokenizedInput {
    answer: {
        answer_type: NAQANetAnswerType;
    };
    loss: number;
    passage_question_attention: number[][];
    /* NOTE: This might be "None", which is Python's equivalent for undefined / null. There's
     * some errant serialization in the backend that should in the long run be fixed to correct
     * this.
     */
    question_id: string;
}

export const isNAQANetPrediction = (pred: Prediction): pred is NAQANetPrediction => {
    const typedPred = pred as NAQANetPrediction;
    return (
        isWithTokenizedInput(pred) &&
        typedPred.answer !== undefined &&
        typedPred.answer.answer_type !== undefined &&
        typedPred.loss !== undefined &&
        typedPred.passage_question_attention !== undefined &&
        typedPred.question_id !== undefined
    );
};

export interface NAQANetPredictionSpan extends NAQANetPrediction {
    answer: {
        answer_type: NAQANetAnswerType;
        spans: [number, number][];
        value: string;
    };
}

export const isNAQANetPredictionSpan = (pred: Prediction): pred is NAQANetPredictionSpan => {
    const typedPred = pred as NAQANetPredictionSpan;
    return (
        isNAQANetPrediction(pred) &&
        typedPred.answer !== undefined &&
        (typedPred.answer.answer_type === NAQANetAnswerType.PassageSpan ||
            typedPred.answer.answer_type === NAQANetAnswerType.QuestionSpan) &&
        typedPred.answer.spans !== undefined &&
        typedPred.answer.value !== undefined
    );
};

export interface NAQANetPredictionCount extends NAQANetPrediction {
    answer: {
        answer_type: NAQANetAnswerType;
        count: number;
    };
}

export const isNAQANetPredictionCount = (pred: Prediction): pred is NAQANetPredictionCount => {
    const typedPred = pred as NAQANetPredictionCount;
    return (
        isNAQANetPrediction(pred) &&
        typedPred.answer !== undefined &&
        typedPred.answer.answer_type === NAQANetAnswerType.Count &&
        typedPred.answer.count !== undefined
    );
};

export interface NumberWithSign {
    value: number;
    span: [number, number];
    sign: number;
}

export interface NAQANetPredictionArithmetic extends NAQANetPrediction {
    answer: {
        answer_type: NAQANetAnswerType;
        value: string;
        numbers: NumberWithSign[];
    };
}

export const isNAQANetPredictionArithmetic = (
    pred: Prediction
): pred is NAQANetPredictionArithmetic => {
    const typedPred = pred as NAQANetPredictionArithmetic;
    return (
        isNAQANetPrediction(pred) &&
        typedPred.answer !== undefined &&
        typedPred.answer.answer_type === NAQANetAnswerType.Arithmetic &&
        typedPred.answer.value !== undefined &&
        typedPred.answer.numbers !== undefined
    );
};

export interface NMNPrediction {
    // TODO
}

export const isNMNPrediction = (pred: Prediction): pred is NMNPrediction => {
    // TODO
    // const typedPred = pred as NMNPrediction;
    return false;
};

export type Prediction =
    | BiDAFPrediction
    | TransformerQAPrediction
    | NAQANetPrediction
    | NMNPrediction;

export const isPrediction = (pred: Prediction): pred is Prediction => {
    const typedPred = pred as Prediction;
    return (
        isNAQANetPrediction(typedPred) ||
        isBiDAFPrediction(typedPred) ||
        isTransformerQAPrediction(typedPred) ||
        isNAQANetPrediction(typedPred) ||
        isNMNPrediction(typedPred)
    );
};

export const getBasicAnswer = (pred: Prediction): number | string => {
    if (isBiDAFPrediction(pred) || isTransformerQAPrediction(pred)) {
        return pred.best_span_str;
    }
    if (isNAQANetPredictionSpan(pred) || isNAQANetPredictionArithmetic(pred)) {
        return pred.answer.value;
    }
    if (isNAQANetPredictionCount(pred)) {
        return pred.answer.count;
    }
    if (isNMNPrediction(pred)) {
        return 'TODO';
    }
    throw new InvalidModelResponseError('Answer not found.');
};
