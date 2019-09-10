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
        const { inputReductionData, reduceInput, requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput} = this.props
        if (attacker === INPUT_REDUCTION_ATTACKER) {
            var original_sentence = '';
            var new_sentence = '';
            var no_reduction = false;
            // called on initialization
            if (inputReductionData === undefined || inputReductionData['input_reduction'] === undefined) {
                new_sentence = " "
            } else {
                original_sentence = inputReductionData["input_reduction"]["original"];
                new_sentence = inputReductionData["input_reduction"]["final"][0];
                no_reduction = JSON.stringify(original_sentence) === JSON.stringify(new_sentence);
                [original_sentence, new_sentence] = colorizeTokensForInputReductionUI(original_sentence, new_sentence);
            }
            const run_button = <button
                                 type="button"
                                 className="btn"
                                 style={{margin: "30px 0px"}}
                                 onClick={ () => reduceInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }
                                >
                                  Reduce Input
                               </button>
            const display_text = new_sentence === " " ?
              <div><p style={{color: "#7c7c7c"}}>Press "reduce input" to run input reduction.</p>{run_button}</div>
            :
              <div>
                <p><strong>Original Input:</strong> {original_sentence}</p>
                <p><strong>Reduced Input:</strong> {new_sentence}</p>
                {no_reduction ? <p>(No reduction was possible)</p> : <p></p>}
              </div>


            return (
                <div>
                    <AccordionItem expanded={true}>
                        <AccordionItemTitle>
                            Input Reduction
                            <div className="accordion__arrow" role="presentation"/>
                        </AccordionItemTitle>
                        <AccordionItemBody>
                            <p>
                                <a href="https://arxiv.org/abs/1804.07781" target="_blank" rel="noopener noreferrer">Input Reduction</a>
                                removes as many words from the input as possible without changing the model's prediction.
                            </p>
                            {display_text}
                        </AccordionItemBody>
                    </AccordionItem>
                </div>
            )
        }
    }
}
