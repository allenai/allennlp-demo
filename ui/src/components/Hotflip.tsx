import React from 'react';

import { RedToken, GreenToken, TransparentToken } from './Tokens';

// NOTE: The original HotFlipComponent handled targeted words to flip.  This was only used in the
// masked-lm task. I have removed this functionality from this component.  We can either add it
// back, or make a new HotflipComponent when we port masked-lm.

class EmptyHotflipRequestError extends Error {
    constructor() {
        super('A Hotflip request cannot be empty.');
    }
}

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

export interface HotflipAttackOutput<T> {
    final: string[][];
    original: string[];
    outputs: T[];
}

interface Props {
    newTokens?: string[];
    originalTokens: string[];
    newPrediction?: React.ReactNode | JSX.Element;
    originalPrediction?: React.ReactNode | JSX.Element;
}

export const Hotflip = ({
    newTokens,
    originalTokens,
    newPrediction,
    originalPrediction,
}: Props) => {
    if (!newTokens) {
        throw new EmptyHotflipRequestError();
    }
    const [originalString, flippedString] = highlightFlippedTokens(originalTokens, newTokens);
    return (
        <>
            <h6>Original Input:</h6> {originalString}
            <h6>Original Prediction:</h6> {originalPrediction || 'Unknown'}
            <h6>Flipped Input:</h6> {flippedString}
            <h6>New Prediction:</h6> {newPrediction || 'Unknown'}
        </>
    );
};
