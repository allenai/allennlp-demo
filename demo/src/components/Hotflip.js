import React from 'react';
import {
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
    } from 'react-accessible-accordion';
import { RedToken, GreenToken, TransparentToken } from './Shared';
import {  HOTFLIP_ATTACKER } from './InterpretConstants'
//import { transformToTree } from './demos/Coref'

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
        const { hotflipData, hotflipInput, requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput } = this.props
        if (attacker === HOTFLIP_ATTACKER){ // if attacker is not INPUT_REDUCTION or other methods
            var original_string = ''
            var flipped_string = ''
            var new_prediction = ''
            var context = " ";
            // enters during initialization
            if (hotflipData === undefined || hotflipData['hotflip'] === undefined) {
                flipped_string = " ";
            }
            // data is available, display the results of Hotflip
            else {
                [original_string, flipped_string] = colorizeTokensForHotflipUI(hotflipData["hotflip"]["original"],
                                                                               hotflipData["hotflip"]["final"][0])
                new_prediction = hotflipData["hotflip"]["new_prediction"]
                context = hotflipData["hotflip"]["context"]
            }
            const run_button = <button
                                 type="button"
                                 className="btn"
                                 style={{margin: "30px 0px"}}
                                 onClick={ () => hotflipInput(requestDataObject, attacker, nameOfInputToAttack, nameOfGradInput) }
                                >
                                  Flip Words
                               </button>

            const display_text = flipped_string === " " ?
              <div><p style={{color: "#7c7c7c"}}>Press "flip words" to run HotFlip.</p>{run_button}</div>
            :
              <div>
                {context !== " " ? context : ""}
                <p><strong>Original Input:</strong> {original_string}</p>
                <p><strong>Flipped Input:</strong> {flipped_string}</p>
                <p><b>Prediction changed to:</b> {new_prediction}</p>
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
                        {display_text}
                    </AccordionItemBody>
                </AccordionItem>
            )
        }
    }
}
