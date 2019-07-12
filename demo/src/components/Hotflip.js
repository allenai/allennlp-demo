import React from 'react';
import {
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { RedToken, GreenToken, TransparentToken } from './Shared';

// takes in the input before and after the hotflip attack and highlights
// the words that were replaced in red and the new words in green
const colorizeTokensForHotflipUI = (original_input, flipped_input) => {
    let original_string_colorized = []
    let flipped_string_colorized = []
    for (let idx = 0; idx < original_input.length; idx++) {
        // if not equal, then add red and green tokens to show a flip
        if (original_input[idx] !== flipped_input[idx]){
            original_string_colorized.push(
                <RedToken key={idx}>
                    {original_input[idx]}
                </RedToken>
            )
            flipped_string_colorized.push(
                <GreenToken key={idx}>
                    {flipped_input[idx]}
                </GreenToken>
            )
        }
        // use transparent background for tokens that are not flipped
        else{
            original_string_colorized.push(
                <TransparentToken key={idx}>
                    {original_input[idx]}
                </TransparentToken>
            )
            flipped_string_colorized.push(
                <TransparentToken key={idx}>
                    {flipped_input[idx]}
                </TransparentToken>
            )
        }
    }
    return [original_string_colorized, flipped_string_colorized]
}


export default class HotflipComponent extends React.Component {
    render() {
        const { hotflipData, hotflipInput, requestDataObject, task, attacker, nameOfInputToAttack, nameOfGradInput } = this.props        
        const HOTFLIP_ATTACKER = 'hotflip'
        if (attacker === HOTFLIP_ATTACKER){ // if attacker is not INPUT_REDUCTION or other methods
            var original_string_colorized = ''
            var flipped_string_colorized = ''
            let new_prediction = ''
            // enters during initialization
            if (hotflipData === undefined || hotflipData['hotflip'] === undefined) { 
                flipped_string_colorized = " ";
            }
            // data is available, display the results of Hotflip
            else{
                var [original_string_colorized,flipped_string_colorized] = colorizeTokensForHotflipUI(hotflipData["hotflip"]["original"],hotflipData["hotflip"]["final"][0])                
                if (task === "Sentiment Analysis") {
                    const [pos, neg] = hotflipData["hotflip"]["outputs"]["probs"]
                    new_prediction = <p><b>Prediction changed to:</b> {pos > neg ? 'Positive' : 'Negative'}</p>
                }
                else if (task === "Textual Entailment") {
                    const [entail, contr, neutral] = hotflipData["hotflip"]["outputs"]["label_probs"]
                    let prediction = ''
                    if (entail > contr) {
                        if (entail > neutral) {
                            prediction = "Entailment"
                        } else {
                            prediction = "Neutral"
                        }
                    } else {
                        if (contr > neutral) {
                            prediction = "Contradiction"
                        } else {
                            prediction = "Neutral"
                        }
                    }
                    new_prediction = <p><b>Prediction changed to:</b> {prediction}</p>
                }
                else if (task === "Reading Comprehension") {                  
                    const output = hotflipData["hotflip"]["outputs"];
                    if ('best_span_str' in output){ // BiDAF model
                       new_prediction = <p><b>Prediction changed to:</b> {output['best_span_str']}</p>
                    }
                    else if ('answer' in output) { // NAQANet model
                        const ans_type = output["answer"]["answer_type"]
                        if(ans_type === "count"){
                            new_prediction = <p><b>Prediction changed to:</b> {output['answer']['count']}</p>
                        }
                        else {
                            new_prediction = <p><b>Prediction changed to:</b> {output['answer']['value']}</p>
                        }
                    }
                }
            }

            if (task === "sentiment"){
                return (
                    <div>
                        <AccordionItem expanded={true}>
                            <AccordionItemTitle>
                                HotFlip Attack
                                <div className="accordion__arrow" role="presentation"/>
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <p> 
                                    <a href="https://arxiv.org/abs/1712.06751" target="_blank" rel="noopener noreferrer">HotFlip</a> flips words in the input to change the model's prediction. We iteratively flip the word in the Hypothesis with the highest gradient until the prediction changes.
                                </p>
                                {flipped_string_colorized !== " " ? <p><strong>Original Input:</strong> {original_string_colorized}</p> : <p style={{color: "#7c7c7c"}}>Press "flip words" to run HotFlip.</p>}
                                {flipped_string_colorized !== " " ? <p><strong>Flipped Input:</strong> {flipped_string_colorized}</p> : <p></p>}
                                {new_prediction}
                                <button type="button" className="btn" style={{margin: "30px 0px"}} onClick={ () => hotflipInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }>Flip Words
                                </button>
                            </AccordionItemBody>
                        </AccordionItem>
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <AccordionItem expanded={true}>
                            <AccordionItemTitle>
                                HotFlip Attack
                                <div className="accordion__arrow" role="presentation"/>
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <p>
                                    <a href="https://arxiv.org/abs/1712.06751" target="_blank" rel="noopener noreferrer">HotFlip</a> flips words to change the model's prediction. We iteratively flip the word  with the highest gradient until the prediction changes.
                                </p>
                                {flipped_string_colorized !== " " ? <p><strong>Original:</strong> {requestDataObject['premise']}</p> : <p></p>}
                                {flipped_string_colorized !== " " ? <p><strong>Original:</strong> {original_string_colorized}</p> : <p style={{color: "#7c7c7c"}}>Press "flip words" to run HotFlip.</p>}
                                {flipped_string_colorized !== " " ? <p><strong>Flipped:</strong> {flipped_string_colorized}</p> : <p></p>}
                                {new_prediction}
                                <button type="button" className="btn" style={{margin: "30px 0px"}} onClick={ () => hotflipInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }>Flip Words
                                </button>
                            </AccordionItemBody>
                        </AccordionItem>
                    </div>
                )
            }
        }
    }
}
