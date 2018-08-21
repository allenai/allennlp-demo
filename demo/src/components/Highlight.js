import React from 'react';

/*******************************************************************************
  <Highlight /> Component
*******************************************************************************/

export default class Highlight extends React.Component {
  render() {
    const { label, labelPosition, color, tooltip, trigger, children } = this.props;

    return (
      <span className={`highlight ${labelPosition ? labelPosition : "bottom"} ${color ? color : ""} ${trigger ? "trigger" : ""}`} data-label={label}>
        {children}
        {tooltip ? (
          <span className="highlight__tooltip">{tooltip}</span>
        ) : null}
      </span>
    );
  }
}
