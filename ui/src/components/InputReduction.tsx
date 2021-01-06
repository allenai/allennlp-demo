import React from 'react';
import { RedToken, TransparentToken, BlankToken } from './Tokens';

/**
 * Takes in the input before and after input reduction and highlights
 * the words that were removed in red with strikeout. The reducedInput
 * will have a less than or equal to length than the originalInput.
 */
const highlightRemovedTokens = (originalInput: string[], reducedInput: string[]) => {
    // TODO: consider moveing the logic of what to remove to the backend api
    // payload could be: [ { "token": "The", "removed": false }, { "token": "quick", "removed": true } ]
    const originalStringColorized = [];
    const reducedStringColorized = [];
    let originalIdx = 0;
    let reducedIdx = 0;
    while (reducedIdx <= reducedInput.length) {
        // if the words are equal, then no red highlight needed (transparent background)
        if (originalInput[originalIdx] === reducedInput[reducedIdx]) {
            originalStringColorized.push(
                <TransparentToken key={originalIdx}>{originalInput[originalIdx]}</TransparentToken>
            );
            reducedStringColorized.push(
                <TransparentToken key={originalIdx}>{reducedInput[reducedIdx]}</TransparentToken>
            );
            originalIdx++;
            reducedIdx++;
        } else {
            // If the words are not equal, keep traversing along the original list, making
            // each token red as you go along. Also add a blank placeholder into the
            // reduced list to make the words line up spacing wise in the UI.
            while (
                originalIdx <= originalInput.length &&
                originalInput[originalIdx] !== reducedInput[reducedIdx]
            ) {
                originalStringColorized.push(
                    <RedToken key={originalIdx}>
                        <s>{originalInput[originalIdx]}</s>
                    </RedToken>
                );
                reducedStringColorized.push(
                    <BlankToken color="transparent" key={originalIdx}>
                        {originalInput[originalIdx]}
                    </BlankToken>
                );
                originalIdx++;
            }
        }
    }
    return [originalStringColorized, reducedStringColorized];
};

export interface InputReductionAttackOutput {
    original: string[];
    final: string[][]; // odd, the current api returns 'final' but the old ui code used 'reduced', makes me worried about the rest of these props
    formattedOriginal?: string;
    formattedReduced?: string[];
    context?: string;
}

export const InputReduction = ({
    original,
    final,
    formattedOriginal,
    formattedReduced,
    context,
}: InputReductionAttackOutput) => {
    // There are a number of ways to tweak the output of this component:
    // (1) you can provide a context, which shows up on top, e.g., for displaying the
    // premise for SNLI.
    // (2) you can format the original input and the reduced input yourself, to
    // customize the display for, e.g., NER.
    return (
        <div>
            {context ? <span>{context}</span> : null}

            {formattedOriginal ? <span>{formattedOriginal}</span> : null}

            {formattedReduced ? (
                <>
                    {!formattedOriginal ? (
                        <p>
                            <h6>Original Input:</h6> {original}
                        </p>
                    ) : null}

                    {(formattedReduced || []).map((formattedReduced: string) => (
                        <span key={formattedReduced}>{formattedReduced}</span>
                    ))}
                </>
            ) : (
                <>
                    {final.map((reduced: string[]) => {
                        const [originalColored, reducedColored] = highlightRemovedTokens(
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

                                {original.length === reduced.length ? (
                                    <p>(No reduction was possible)</p>
                                ) : null}
                            </>
                        );
                    })}
                </>
            )}
        </div>
    );
};
