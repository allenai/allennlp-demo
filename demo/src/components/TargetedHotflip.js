import React from 'react';
import { FormField, FormInput } from './Form';
import {
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { RedToken, GreenToken, TransparentToken } from './Shared';
import {  HOTFLIP_ATTACKER } from './InterpretConstants'
import { transformToTree } from './demos/Coref'
import HighlightContainer from './highlight/HighlightContainer';
import { Highlight, getHighlightColor } from './highlight/Highlight';

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


export default class TargetedHotflipComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedCluster: -1,
      activeIds: [],
      activeDepths: {ids:[],depths:[]},
      selectedId: null,
      isClicking: false
    };

    this.updateTargetWord = this.updateTargetWord.bind(this);
    this.handleHighlightMouseDown = this.handleHighlightMouseDown.bind(this);
    this.handleHighlightMouseOver = this.handleHighlightMouseOver.bind(this);
    this.handleHighlightMouseOut = this.handleHighlightMouseOut.bind(this);
    this.handleHighlightMouseUp = this.handleHighlightMouseUp.bind(this);
  }

  handleHighlightMouseDown(id, depth) {
    let depthTable = this.state.activeDepths;
    depthTable.ids.push(id);
    depthTable.depths.push(depth);

    this.setState({
      selectedId: null,
      activeIds: [id],
      activeDepths: depthTable,
      isClicking: true
    });
  }

  handleHighlightMouseUp(id, prevState) {
    const depthTable = this.state.activeDepths;
    const deepestIndex = depthTable.depths.indexOf(Math.max(...depthTable.depths));

    this.setState(prevState => ({
      selectedId: depthTable.ids[deepestIndex],
      isClicking: false,
      activeDepths: {ids:[],depths:[]},
      activeIds: [...prevState.activeIds, id],
    }));
  }

  updateTargetWord(e) {
    this.setState({target_word: e.target.value});
  }

  handleHighlightMouseOver(id, prevState) {
    this.setState(prevState => ({
      activeIds: [...prevState.activeIds, id],
    }));
  }

  handleHighlightMouseOut(id, prevState) {
    this.setState(prevState => ({
      activeIds: prevState.activeIds.filter(i => (i === this.state.selectedId)),
    }));
  }

    render() {
        const { hotflipData, hotflipInput, requestDataObject, task, attacker, nameOfInputToAttack, nameOfGradInput } = this.props        
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
                else if (task === "Masked Language Modeling") {
                    console.log(hotflipData);
                    new_prediction = <p><b>Prediction changed to:</b> {hotflipData["hotflip"]["outputs"]["words"][0][0]}</p>
                }
                else if (task === "Co-reference Resolution") {
                    // This is the function that calls itself when we recurse over the span tree.
                    const spanWrapper = (data, depth) => {
                      return data.map((token, idx) =>
                        typeof(token) === "object" ? (
                          <Highlight
                            key={idx}
                            activeDepths={this.activeDepths}
                            activeIds={this.activeIds}
                            color={getHighlightColor(token.cluster)}
                            depth={depth}
                            id={token.cluster}
                            isClickable={true}
                            isClicking={this.isClicking}
                            label={token.cluster}
                            labelPosition="left"
                            onMouseDown={this.handleHighlightMouseDown}
                            onMouseOver={this.handleHighlightMouseOver}
                            onMouseOut={this.handleHighlightMouseOut}
                            onMouseUp={this.handleHighlightMouseUp}
                            selectedId={this.selectedId}>
                            {/* Call Self */}
                            {spanWrapper(token.contents, depth + 1)}
                          </Highlight>
                        ) : (
                          <span key={idx}>{token} </span>
                        )
                      );
                    };
                    [original_string_colorized,flipped_string_colorized] = colorizeTokensForHotflipUI(hotflipData["hotflip"]["original"],hotflipData["hotflip"]["final"][hotflipData["hotflip"]["final"].length-1])
                    console.log(hotflipData["hotflip"]["final"][hotflipData["hotflip"]["final"].length-1]);
                    console.log(hotflipData["hotflip"]["outputs"]["clusters"]);
                    new_prediction = <div className="model__content answer"><b>Prediction changed to:</b><FormField><HighlightContainer isClicking={this.isClicking}>{spanWrapper(transformToTree(hotflipData["hotflip"]["final"][hotflipData["hotflip"]["final"].length-1], hotflipData["hotflip"]["outputs"]["clusters"]), 0)}</HighlightContainer></FormField></div>;
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

            if (task === "Sentiment Analysis" || task === "Co-reference Resolution" || task === "Masked Language Modeling"){
                return (
                    <div>
                        <AccordionItem expanded={true}>
                            <AccordionItemTitle>
                                Targeted HotFlip Attack
                                <div className="accordion__arrow" role="presentation"/>
                            </AccordionItemTitle>
                            <AccordionItemBody>
                                <p>
                                    <a href="https://arxiv.org/abs/1712.06751" target="_blank" rel="noopener noreferrer">HotFlip</a> flips words in the input to change the model's prediction. We iteratively flip the word in the Hypothesis with the highest gradient until the prediction changes.
                                </p>
                                {flipped_string_colorized !== " " ? <p><strong>Original Input:</strong> {original_string_colorized}</p> : <p style={{color: "#7c7c7c"}}>Press "flip words" to run HotFlip.</p>}
                                {flipped_string_colorized !== " " ? <p><strong>Flipped Input:</strong> {flipped_string_colorized}</p> : <p></p>}
                                {new_prediction}
                                <p>
                                  Change prediction to: <FormInput type="text" onChange={ this.updateTargetWord }/>
                                </p>
                                <button type="button" className="btn" style={{margin: "30px 0px"}} onClick={ () => hotflipInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput, this.state) }>Flip Words
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
                                <button type="button" className="btn" style={{margin: "30px 0px"}} onClick={ () => hotflipInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput, this.state) }>Flip Words
                                </button>
                            </AccordionItemBody>
                        </AccordionItem>
                                {new_prediction}
                    </div>
                )
            }
        }
    }
}
