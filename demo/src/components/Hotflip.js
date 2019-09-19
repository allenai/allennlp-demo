import React from 'react';
import {
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { RedToken, GreenToken, TransparentToken } from './Shared';
import {  HOTFLIP_ATTACKER } from './InterpretConstants'

// takes in the input before and after the hotflip attack and highlights
// the words that were replaced in red and the new words in green
const colorizeTokensForHotflipUI = (originalInput, flippedInput) => {
    let originalStringColorized = []
    let flippedStringColorized = []
    for (let idx = 0; idx < originalInput.length; idx++) {
        // if not equal, then add red and green tokens to show a flip
        if (originalInput[idx] !== flippedInput[idx]){
            originalStringColorized.push(
                <RedToken key={idx}>
                    {originalInput[idx]}
                </RedToken>
            )
            flippedStringColorized.push(
                <GreenToken key={idx}>
                    {flippedInput[idx]}
                </GreenToken>
            )
        } else {
        // use transparent background for tokens that are not flipped
            originalStringColorized.push(
                <TransparentToken key={idx}>
                    {originalInput[idx]}
                </TransparentToken>
            )
            flippedStringColorized.push(
                <TransparentToken key={idx}>
                    {flippedInput[idx]}
                </TransparentToken>
            )
        }
    }
    return [originalStringColorized, flippedStringColorized]
}


export default class HotflipComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedCluster: -1,
      activeIds: [],
      activeDepths: {ids:[],depths:[]},
      selectedId: null,
      isClicking: false
    };

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
        const { hotflipData, hotflipFunction, requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput } = this.props
        if (attacker === HOTFLIP_ATTACKER){ // if attacker is not INPUT_REDUCTION or other methods
            let originalString = ''
            let flippedString = ''
            let newPrediction = ''
            let context = " ";
            // enters during initialization
            if (hotflipData === undefined) {
                flippedString = " ";
            }
            // data is available, display the results of Hotflip
            else {
                [originalString, flippedString] = colorizeTokensForHotflipUI(hotflipData["original"],
                                                                             hotflipData["final"][0])
                newPrediction = hotflipData["new_prediction"]
                context = hotflipData["context"]
            }
            const runButton = <button
                                type="button"
                                className="btn"
                                style={{margin: "30px 0px"}}
                                onClick={ () => hotflipFunction(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }
                               >
                                 Flip Words
                              </button>

            const displayText = flippedString === " " ?
              <div><p style={{color: "#7c7c7c"}}>Press "flip words" to run HotFlip.</p>{runButton}</div>
            :
              <div>
                {context !== " " ? context : ""}
                <p><strong>Original Input:</strong> {originalString}</p>
                <p><strong>Flipped Input:</strong> {flippedString}</p>
                <p><b>Prediction changed to:</b> {newPrediction}</p>
              </div>

            return (
                <AccordionItem>
                    <AccordionItemTitle>
                        HotFlip Attack
                        <div className="accordion__arrow" role="presentation"/>
                    </AccordionItemTitle>
                    <AccordionItemBody>
                        <p>
                            <a href="https://arxiv.org/abs/1712.06751" target="_blank" rel="noopener noreferrer">HotFlip</a> flips words in the input to change the model's prediction. We iteratively flip the input word with the highest gradient until the prediction changes.
                        </p>
                        {displayText}
                    </AccordionItemBody>
                </AccordionItem>
            )
        }
    }
}
