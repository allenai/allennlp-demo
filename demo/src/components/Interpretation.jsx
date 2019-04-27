import React from 'react';
import colormap from 'colormap'
import assert from 'assert'

class Interpretation extends React.Component {
  constructor(props) {
    super(props);

    this.colorize = this.colorize.bind(this);
  }

  colorize(tokens, grads) {
    let colors = colormap({
      colormap: 'RdBu',
      format: 'hex'
    })

    // make sure tokens and grads have same length
    assert.strictEqual(tokens.length, grads.length)

    let result_string = [];
    tokens.forEach((token, idx) => {
      result_string.push(<span style={
        {
          // There is 72 different shades in the spectrum 
          backgroundColor: colors[Math.round(grads[idx] * 71)],
          padding: "5px",
          margin: "5px",
          display: "inline-block",
          borderRadius: "3px"
        }
        } key={idx}>{token} </span>)
    })

    return result_string 
  }

  render() {

    const { premise_tokens, hypothesis_tokens, premise_normalization, hypothesis_normalization } = this.props 

    const premise_color_map = this.colorize(premise_tokens, premise_normalization)
    const hypothesis_color_map = this.colorize(hypothesis_tokens, hypothesis_normalization)

    return (
      <div>
        <div className="model__content__summary">
          The interpretation map below shows a <strong>red-blue colormap</strong> where:
          <ul>
            <li><strong>Red </strong>is a negative contribution to the prediction</li>
            <li><strong>Blue </strong>is a positive contribution to the prediction</li>
          </ul>
        </div>

        <div className="form__field">
          <label>Premise Interpretation</label>
          <div className="model__content__summary">{ premise_color_map }</div>
        </div>

        <div className="form__field">
          <label>Hypothesis Interpretation</label>
          <div className="model__content__summary">{ hypothesis_color_map }</div>
        </div>
      </div>
    )
  }
}

export default Interpretation; 
