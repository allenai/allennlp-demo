import React from 'react';
import {
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { RedToken, TransparentToken, BlankToken } from './Shared';
import { INPUT_REDUCTION_ATTACKER } from './InterpretConstants'

// takes in the input before and after input reduction and highlights
// the words that were removed in red with strikeout. The reduced_input
// will have a less than or equal to length than the original_input.
const colorizeTokensForInputReductionUI = (original_input, reduced_input) => {
    let original_string_colorized = []
    let reduced_string_colorized = []
    var idx = 0;
    var idx2 = 0;
    while (idx2 <= reduced_input.length){
        // if the words are equal, then no red highlight needed (transparent background)
        if (original_input[idx] === reduced_input[idx2]){
            original_string_colorized.push(
                <TransparentToken key={idx}>
                    {original_input[idx]}
                </TransparentToken>
            )
            reduced_string_colorized.push(
                <TransparentToken key={idx}>
                    {reduced_input[idx2]}
                </TransparentToken>
            )
            idx++;
            idx2++;
        }
        // if the words are not equal, keep traversing along the original list, making
        // each token red as you go along. Also add a blank placeholder into the
        // reduced list to make the words line up spacing wise in the UI.
        else {
            while (idx <= original_input.length && original_input[idx] !== reduced_input[idx2]){
                original_string_colorized.push(
                    <RedToken key={idx}>
                        <strike>{original_input[idx]}</strike>
                    </RedToken>
                )
                reduced_string_colorized.push(
                    <BlankToken key={idx}>
                        {original_input[idx]}
                    </BlankToken>
                )
                idx++;
            }
        }
    }
    return [original_string_colorized, reduced_string_colorized]
}

export default class InputReductionComponent extends React.Component {
    render() {
        const { reduceFunction, requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput, reducedInput} = this.props
        if (attacker === INPUT_REDUCTION_ATTACKER) {
            const run_button = <button
                                 type="button"
                                 className="btn"
                                 style={{margin: "30px 0px"}}
                                 onClick={ () => reduceFunction(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }
                                >
                                  Reduce Input
                               </button>

            var display_text = '';
            if (reducedInput === undefined) {
                display_text = <div><p style={{color: "#7c7c7c"}}>Press "reduce input" to run input reduction.</p>{run_button}</div>
            } else {
                // There are a number of ways to tweak the output of this component:
                // (1) you can provide a context, which shows up on top, e.g., for displaying the
                // premise for SNLI.
                // (2) you can format the original input and the reduced input yourself, to
                // customize the display for, e.g., NER.
                const original = reducedInput["original"];
                const formatted_original = reducedInput["formatted_original"];
                var internal_text = [];
                if ("context" in reducedInput) {
                    internal_text.push(reducedInput["context"]);
                }
                if (formatted_original !== undefined) {
                    internal_text.push(formatted_original);
                }
                if ("formatted_reduced" in reducedInput) {
                    if (formatted_original === undefined) {
                        internal_text.push(<p><strong>Original Input:</strong> {original}</p>)
                    }
                    reducedInput["formatted_reduced"].forEach(formatted_reduced => {
                        internal_text.push(formatted_reduced);
                    })
                } else {
                    reducedInput["reduced"].forEach(reduced => {
                        const no_reduction = JSON.stringify(original) === JSON.stringify(reduced);
                        const [original_colored, reduced_colored] = colorizeTokensForInputReductionUI(original, reduced);
                        if (formatted_original === undefined) {
                            internal_text.push(<p><strong>Original Input:</strong> {original_colored}</p>)
                        }
                        internal_text.push(<p><strong>Reduced Input:</strong> {reduced_colored}</p>)
                        internal_text.push(no_reduction ? <p>(No reduction was possible)</p> : <p></p>)
                    })
                }
                display_text = <div>{internal_text}</div>
            }

            return (
                <AccordionItem>
                    <AccordionItemTitle>
                        Input Reduction
                        <div className="accordion__arrow" role="presentation"/>
                    </AccordionItemTitle>
                    <AccordionItemBody>
                        <p>
                            <a href="https://arxiv.org/abs/1804.07781" target="_blank" rel="noopener noreferrer">Input Reduction</a> removes as many words from the input as possible without changing the model's prediction.
                        </p>
                        {display_text}
                    </AccordionItemBody>
                </AccordionItem>
            )
        }
    }
}
