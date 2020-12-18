export interface Input {
    passage: string;
    question: string;
}

export interface BiDAFPrediction {
    best_span: number[];
    best_span_str: string;
    passage_question_attention: number[][];
    passage_tokens: string[];
    question_tokens: string[];
    span_end_logits: number[];
    span_end_probs: number[];
    span_start_logits: number[];
    span_start_probs: number[];
    token_offsets: number[][];
}

// TODO: i dont think this is used
export interface TransformerQAPrediction {
    best_span: number[];
    best_span_scores: number;
    best_span_str: string;
    context_tokens: string[];
    id: string;
    span_end_logits: number[];
    span_start_logits: number[];
}

export enum NAQANetAnswerType {
    PassageSpan = 'passage_span',
    QuestionSpan = 'question_span',
    Count = 'count',
    Arithmetic = 'arithmetic',
}

export interface NAQANetPrediction {
    answer: {
        'answer-type': NAQANetAnswerType;
        spans: number[];
        value: string;
    };
    loss: number;
    passage_question_attention: number[][];
    passage_tokens: string[];
    /* NOTE: This might be "None", which is Python's equivalent for undefined / null. There's
     * some errant serialization in the backend that should in the long run be fixed to correct
     * this.
     */
    question_id: string;
    question_tokens: string[];
}

export type Prediction = BiDAFPrediction | TransformerQAPrediction | NAQANetPrediction;
