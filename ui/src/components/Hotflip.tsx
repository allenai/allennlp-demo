import React from 'react';

import { RedToken, GreenToken, TransparentToken } from './Tokens';

// NOTE: The original HotFlipComponent handled targeted words to flip.  This was used in the
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
    new_prediction?: string;
    context?: string;
}

export const Hotflip = ({ final, original, new_prediction, context }: HotflipAttackOutput) => {
    const [originalString, flippedString] = highlightFlippedTokens(
        original,
        final[0] // just the first one, huh,... yuck
    );

    return (
        <div>
            {context ? <span>{context}</span> : null}

            <p>
                <h6>Original Input:</h6> {originalString}
            </p>
            <p>
                <h6>Flipped Input:</h6> {flippedString}
            </p>

            {new_prediction ? (
                <p>
                    <h6>New Prediction:</h6> {new_prediction}
                </p>
            ) : null}
        </div>
    );
};
