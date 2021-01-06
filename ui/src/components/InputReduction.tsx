// TODO: move to tugboat?

import React from 'react';
import { RedToken, TransparentToken, BlankToken } from './Tokens';

// takes in the input before and after input reduction and highlights
// the words that were removed in red with strikeout. The reducedInput
// will have a less than or equal to length than the originalInput.
const colorizeTokensForInputReductionUI = (originalInput: string[], reducedInput: string[]) => {
    const originalStringColorized = [];
    const reducedStringColorized = [];
    let idx = 0;
    let idx2 = 0;
    while (idx2 <= reducedInput.length) {
        // if the words are equal, then no red highlight needed (transparent background)
        if (originalInput[idx] === reducedInput[idx2]) {
            originalStringColorized.push(
                <TransparentToken key={idx}>{originalInput[idx]}</TransparentToken>
            );
            reducedStringColorized.push(
                <TransparentToken key={idx}>{reducedInput[idx2]}</TransparentToken>
            );
            idx++;
            idx2++;
        } else {
            // if the words are not equal, keep traversing along the original list, making
            // each token red as you go along. Also add a blank placeholder into the
            // reduced list to make the words line up spacing wise in the UI.
            while (idx <= originalInput.length && originalInput[idx] !== reducedInput[idx2]) {
                originalStringColorized.push(
                    <RedToken key={idx}>
                        <s>{originalInput[idx]}</s>
                    </RedToken>
                );
                reducedStringColorized.push(
                    <BlankToken color="transparent" key={idx}>
                        {originalInput[idx]}
                    </BlankToken>
                );
                idx++;
            }
        }
    }
    return [originalStringColorized, reducedStringColorized];
};

export interface InputReductionAttackOutput {
    original: string[];
    final: string[][]; // odd, the current api retuns 'final' but the old ui code used 'reduced', makes me worried about the rest of these props
    formattedOriginal?: string;
    formattedReduced?: string[];
    context?: string;
}

export const InputReduction = (reducedInput: InputReductionAttackOutput) => {
    // There are a number of ways to tweak the output of this component:
    // (1) you can provide a context, which shows up on top, e.g., for displaying the
    // premise for SNLI.
    // (2) you can format the original input and the reduced input yourself, to
    // customize the display for, e.g., NER.
    const original = reducedInput.original;
    const formattedOriginal = reducedInput.formattedOriginal;
    return (
        <div>
            {reducedInput.context ? <span>{reducedInput.context}</span> : null}

            {formattedOriginal ? <span>{formattedOriginal}</span> : null}

            {reducedInput.formattedReduced ? (
                <>
                    {!formattedOriginal ? (
                        <p>
                            <h6>Original Input:</h6> {original}
                        </p>
                    ) : null}

                    {(reducedInput.formattedReduced || []).map((formattedReduced: string) => (
                        <span key={formattedReduced}>{formattedReduced}</span>
                    ))}
                </>
            ) : (
                <>
                    {reducedInput.final.map((reduced: string[]) => {
                        const noReduction = JSON.stringify(original) === JSON.stringify(reduced);
                        const [originalColored, reducedColored] = colorizeTokensForInputReductionUI(
                            original,
                            reduced
                        );
                        return (
                            <>
                                {!formattedOriginal ? (
                                    <p>
                                        <h6>Original Input:</h6> {originalColored}
                                    </p>
                                ) : null}

                                <p>
                                    <h6>Reduced Input:</h6> {reducedColored}
                                </p>

                                {noReduction ? <p>(No reduction was possible)</p> : null}
                            </>
                        );
                    })}
                </>
            )}
        </div>
    );
};
