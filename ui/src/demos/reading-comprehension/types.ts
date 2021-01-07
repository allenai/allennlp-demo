import { WithTokenizedInput, isWithTokenizedInput } from '../../lib';

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

export const isBiDAFPrediction = (x: Prediction): x is BiDAFPrediction => {
    const xx = x as BiDAFPrediction;
    return (
        isWithTokenizedInput(x) &&
        xx.best_span !== undefined &&
        xx.best_span_str !== undefined &&
        xx.passage_question_attention !== undefined &&
        xx.span_end_logits !== undefined &&
        xx.span_end_probs !== undefined &&
        xx.span_start_logits !== undefined &&
        xx.span_start_probs !== undefined &&
        xx.token_offsets !== undefined
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

export const isTransformerQAPrediction = (x: Prediction): x is TransformerQAPrediction => {
    const xx = x as TransformerQAPrediction;
    return (
        xx.best_span !== undefined &&
        xx.best_span_scores !== undefined &&
        xx.best_span_str !== undefined &&
        xx.context_tokens !== undefined &&
        xx.id !== undefined &&
        xx.span_end_logits !== undefined &&
        xx.span_start_logits !== undefined
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

export const isNAQANetPrediction = (x: Prediction): x is NAQANetPrediction => {
    const xx = x as NAQANetPrediction;
    return (
        isWithTokenizedInput(x) &&
        xx.answer !== undefined &&
        xx.answer.answer_type !== undefined &&
        xx.loss !== undefined &&
        xx.passage_question_attention !== undefined &&
        xx.question_id !== undefined
    );
};

export interface NAQANetPredictionSpan extends NAQANetPrediction {
    answer: {
        answer_type: NAQANetAnswerType;
        spans: [number, number][];
        value: string;
    };
}

export const isNAQANetPredictionSpan = (x: Prediction): x is NAQANetPredictionSpan => {
    const xx = x as NAQANetPredictionSpan;
    return (
        isNAQANetPrediction(x) &&
        xx.answer !== undefined &&
        (xx.answer.answer_type === NAQANetAnswerType.PassageSpan ||
            xx.answer.answer_type === NAQANetAnswerType.QuestionSpan) &&
        xx.answer.spans !== undefined &&
        xx.answer.value !== undefined
    );
};

export interface NAQANetPredictionCount extends NAQANetPrediction {
    answer: {
        answer_type: NAQANetAnswerType;
        count: number;
    };
}

export const isNAQANetPredictionCount = (x: Prediction): x is NAQANetPredictionCount => {
    const xx = x as NAQANetPredictionCount;
    return (
        isNAQANetPrediction(x) &&
        xx.answer !== undefined &&
        xx.answer.answer_type === NAQANetAnswerType.Count &&
        xx.answer.count !== undefined
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

export const isNAQANetPredictionArithmetic = (x: Prediction): x is NAQANetPredictionArithmetic => {
    const xx = x as NAQANetPredictionArithmetic;
    return (
        isNAQANetPrediction(x) &&
        xx.answer !== undefined &&
        xx.answer.answer_type === NAQANetAnswerType.Arithmetic &&
        xx.answer.value !== undefined &&
        xx.answer.numbers !== undefined
    );
};

export interface NMNPrediction {
    // TODO
}

export const isNMNPrediction = (x: Prediction): x is NMNPrediction => {
    // TODO
    // const xx = x as NMNPrediction;
    return false;
};

export type Prediction =
    | BiDAFPrediction
    | TransformerQAPrediction
    | NAQANetPrediction
    | NMNPrediction;

export const isPrediction = (x: Prediction): x is Prediction => {
    const xx = x as Prediction;
    return (
        isNAQANetPrediction(xx) ||
        isBiDAFPrediction(xx) ||
        isTransformerQAPrediction(xx) ||
        isNAQANetPrediction(xx) ||
        isNMNPrediction(xx)
    );
};
