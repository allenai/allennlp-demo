import React from 'react';
import {  
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
  } from 'react-accessible-accordion';
import { ColorizedToken, BlankToken } from './Shared';

function postprocessInputReduction(org,data){
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
  constructor(props) {
    super(props)      
  }
  
  render() {
    const { inputReductionData, reduceInput, requestDataObject } = this.props     

    console.log(inputReductionData);
    var original_sentence_colorized = '';
    var new_sentence_colorized = '';    
    if (inputReductionData === undefined) {
      new_sentence_colorized = " "
    }
    else{    
      console.log(inputReductionData["original"]);
      console.log(inputReductionData["final"][0]);
      var [first,second] = postprocessInputReduction(inputReductionData["original"],inputReductionData["final"][0])    
      new_sentence_colorized = second
      original_sentence_colorized = first
    }  
    console.log(new_sentence_colorized)
    console.log(original_sentence_colorized)

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
          onClick={ () => reduceInput(requestDataObject) }>Reduce Input
        </button>
        </AccordionItemBody></AccordionItem></div>
    )
  }
}