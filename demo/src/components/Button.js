import React from 'react';
import '../css/Button.css';

/*******************************************************************************
  <Button /> Component
*******************************************************************************/

export default class Button extends React.Component {
  render() {
    const { enabled, runModel, inputs, modelEndpoint} = this.props;

    return (
    <button id="input--mc-submit" type="button" disabled={!enabled} className="btn btn--icon-disclosure" onClick={ (event) => { runModel(event, inputs, modelEndpoint) }}>Run
      <svg>
        <use xlinkHref="#icon__disclosure"></use>
      </svg>
    </button>
    );
  }
}
