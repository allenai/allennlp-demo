import React from 'react';
import styled from 'styled-components';
import { Collapse } from '@allenai/varnish';

import { RedToken, TransparentToken, BlankToken } from './Shared';

// takes in the input before and after input reduction and highlights
// the words that were removed in red with strikeout. The reducedInput
// will have a less than or equal to length than the originalInput.
const colorizeTokensForInputReductionUI = (originalInput, reducedInput) => {
    let originalStringColorized = []
    let reducedStringColorized = []
    let idx = 0;
    let idx2 = 0;
    while (idx2 <= reducedInput.length){
        // if the words are equal, then no red highlight needed (transparent background)
        if (originalInput[idx] === reducedInput[idx2]){
            originalStringColorized.push(
                <TransparentToken key={idx}>
                    {originalInput[idx]}
                </TransparentToken>
            )
            reducedStringColorized.push(
                <TransparentToken key={idx}>
                    {reducedInput[idx2]}
                </TransparentToken>
            )
            idx++;
            idx2++;
        } else {
            // if the words are not equal, keep traversing along the original list, making
            // each token red as you go along. Also add a blank placeholder into the
            // reduced list to make the words line up spacing wise in the UI.
            while (idx <= originalInput.length && originalInput[idx] !== reducedInput[idx2]){
                originalStringColorized.push(
                    <RedToken key={idx}>
                        <strike>{originalInput[idx]}</strike>
                    </RedToken>
                )
                reducedStringColorized.push(
                    <BlankToken key={idx}>
                        {originalInput[idx]}
                    </BlankToken>
                )
                idx++;
            }
        }
    }
    return [originalStringColorized, reducedStringColorized]
}

export default class InputReductionComponent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        loading: false,
      }

      this.callReduceFunction = this.callReduceFunction.bind(this)
    }

    callReduceFunction = reduceFunction => () => {
      this.setState({ ...this.state, loading: true})
      reduceFunction({}).then(() => this.setState({ loading: false }))
    }

    render() {
        const { reduceFunction, reducedInput } = this.props
        const runButton = <button
                            type="button"
                            className="btn"
                            style={{margin: "30px 0px"}}
                            onClick={this.callReduceFunction(reduceFunction) }
                           >
                             Reduce Input
                          </button>

        let displayText = '';
        if (reducedInput === undefined) {
            if (this.state.loading) {
              displayText = <div><p style={{color: "#7c7c7c"}}>Loading reduction...</p></div>
            } else {
              displayText = <div><p style={{color: "#7c7c7c"}}>Press "reduce input" to run input reduction.</p>{runButton}</div>
            }
        } else {
            // There are a number of ways to tweak the output of this component:
            // (1) you can provide a context, which shows up on top, e.g., for displaying the
            // premise for SNLI.
            // (2) you can format the original input and the reduced input yourself, to
            // customize the display for, e.g., NER.
            const original = reducedInput.original;
            const formattedOriginal = reducedInput.formattedOriginal;
            let internalText = [];
            if ("context" in reducedInput) {
                internalText.push(reducedInput["context"]);
            }
            if (formattedOriginal !== undefined) {
                internalText.push(formattedOriginal);
            }
            if (reducedInput.formattedReduced !== undefined) {
                if (formattedOriginal === undefined) {
                    internalText.push(<p><strong>Original Input:</strong> {original}</p>)
                }
                reducedInput.formattedReduced.forEach(formattedReduced => {
                    internalText.push(formattedReduced);
                })
            } else {
                reducedInput["reduced"].forEach(reduced => {
                    const noReduction = JSON.stringify(original) === JSON.stringify(reduced);
                    const [originalColored, reducedColored] = colorizeTokensForInputReductionUI(original, reduced);
                    if (formattedOriginal === undefined) {
                        internalText.push(<p><strong>Original Input:</strong> {originalColored}</p>)
                    }
                    internalText.push(<p><strong>Reduced Input:</strong> {reducedColored}</p>)
                    internalText.push(noReduction ? <p>(No reduction was possible)</p> : <p></p>)
                })
            }
            displayText = <div>{internalText.map((text, i) => <span key={i}>{text}</span>)}</div>
        }

        return (
            <>
                <p>
                    <a href="https://arxiv.org/abs/1804.07781" target="_blank" rel="noopener noreferrer">Input Reduction</a> removes as many words from the input as possible without changing the model's prediction.
                </p>
                {displayText}
            </>
        )
    }
}

export const InputReductionPanel = styled(Collapse.Panel).attrs({
    header: "Input Reduction"
  })``;
