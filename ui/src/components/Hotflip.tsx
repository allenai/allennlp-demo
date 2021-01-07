import React from 'react';

import { RedToken, GreenToken, TransparentToken } from './Tokens';

// NOTE: The original HotFlipComponent handled targeted words to flip.  This was only used in the
// masked-lm task. I have removed this functionality from this component.  We can either add it
// back, or make a new HotflipComponent when we port masked-lm.

/**
 * Takes in the input before and after the hotflip attack and highlights
 * the words that were replaced in red and the new words in green
 */
const highlightFlippedTokens = (originalInput: string[], flippedInput: string[]) => {
    const originalStringColorized = [];
    const flippedStringColorized = [];
    for (let idx = 0; idx < originalInput.length; idx++) {
        // if not equal, then add red and green tokens to show a flip
        if (originalInput[idx] !== flippedInput[idx]) {
            originalStringColorized.push(<RedToken key={idx}>{originalInput[idx]}</RedToken>);
            flippedStringColorized.push(<GreenToken key={idx}>{flippedInput[idx]}</GreenToken>);
        } else {
            // use transparent background for tokens that are not flipped
            originalStringColorized.push(
                <TransparentToken key={idx}>{originalInput[idx]}</TransparentToken>
            );
            flippedStringColorized.push(
                <TransparentToken key={idx}>{flippedInput[idx]}</TransparentToken>
            );
        }
    }
    return [originalStringColorized, flippedStringColorized];
};

export interface HotflipAttackOutput {
    final: string[][];
    original: string[];
    context?: string;
    outputs: Output[];
}
export interface Output {
    best_span: number[];
    best_span_str: string;
    loss: number;
    passage_question_attention: number[][];
    passage_tokens: string[];
    question_tokens: string[];
    span_end_logits: number[];
    span_end_probs: number[];
    span_start_logits: number[];
    span_start_probs: number[];
    token_offsets: number[][];
}

export const Hotflip = ({ final, original, outputs, context }: HotflipAttackOutput) => {
    const finalIndexToShow = 0;
    const [originalString, flippedString] = highlightFlippedTokens(
        original,
        final[finalIndexToShow]
    );

    return (
        <p>
            {context ? <span>{context}</span> : null}
            <h6>Original Input:</h6> {originalString}
            <h6>Flipped Input:</h6> {flippedString}
            {outputs.length && outputs[0].best_span_str ? (
                <>
                    <h6>New Prediction:</h6> {outputs[finalIndexToShow].best_span_str}
                </>
            ) : null}
        </p>
    );
};
