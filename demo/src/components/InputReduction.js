import React from 'react';
import {  
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { ColorizedToken, BlankToken } from './Shared';

const colorizeTokensForInputReductionUI = (org, data) => {   
    let original_string_colorized = []
    let new_string_colorized = []  
    var idx = 0;
    var idx2 = 0;
    while (idx2 <= data.length){    
        if (org[idx] === data[idx2]){
            original_string_colorized.push(
                <ColorizedToken backgroundColor={"transparent"}
                key={idx}>{org[idx]} </ColorizedToken>);
            new_string_colorized.push(
                <ColorizedToken backgroundColor={"transparent"}
                key={idx}>{data[idx2]} </ColorizedToken>);      
            idx++;
            idx2++;
        }       
        else {
            while (idx<=org.length && org[idx] !== data[idx2]){
                original_string_colorized.push(
                    <ColorizedToken backgroundColor={"#FF5733"}
                    key={idx}><strike>{org[idx]}</strike> </ColorizedToken>);

                new_string_colorized.push(
                    <BlankToken key={idx}>{org[idx]} </BlankToken>);
                    idx++;            
            }
        }
    }
    
    return [original_string_colorized,new_string_colorized]
}

export default class InputReductionComponent extends React.Component {
    render() {
        const { inputReductionData, reduceInput, requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput} = this.props       
        const INPUT_REDUCTION_ATTACKER = 'input_reduction'
        if (attacker === INPUT_REDUCTION_ATTACKER){      
            var original_sentence_colorized = '';
            var new_sentence_colorized = '';    
            if (inputReductionData === undefined || inputReductionData['input_reduction'] === undefined){
                new_sentence_colorized = " "
            }
            else{                
                var [first,second] = colorizeTokensForInputReductionUI(inputReductionData["input_reduction"]["original"],inputReductionData["input_reduction"]["final"][0])    
                new_sentence_colorized = second
                original_sentence_colorized = first
            }      

            return (<div><AccordionItem expanded={true}>               
                    <AccordionItemTitle>
                                Input Reduction
                                <div className="accordion__arrow" role="presentation"/>
                            </AccordionItemTitle>
                            <AccordionItemBody>                  
                 <p> <a href="https://arxiv.org/abs/1804.07781" target="_blank" rel="noopener noreferrer">Input Reduction</a> removes as many words from the input as possible without changing the model's prediction.</p>
                    {new_sentence_colorized !== " " ? <p><strong>Original Input:</strong> {original_sentence_colorized}</p> : <p style={{color: "#7c7c7c"}}>Press "reduce input" to run input reduction.</p>}    
                                {new_sentence_colorized !== " " ? <p><strong>Reduced Input:</strong> {new_sentence_colorized}</p> : <p></p>}          
                        <button
                            type="button"
                            className="btn"
                            style={{margin: "30px 0px"}}
                            onClick={ () => reduceInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }>Reduce Input
                        </button>
                        </AccordionItemBody></AccordionItem></div>
                )
        }
    }
}