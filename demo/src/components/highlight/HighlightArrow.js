import React from 'react';
import '../../css/HighlightArrow.css';

/*******************************************************************************
  <HighlightArrow /> Component

  This component creates a directional arrow as a visual element of a diagram.
  For example, see Event2Mind diagram visualization.

*******************************************************************************/

export default class HighlightArrow extends React.Component {
  render() {
    const {         // All fields optional:
      color,        // string (see highlightColors for supported values)
      direction,    // string (supported values: "top", left", "right", "bottom")
    } = this.props;

    return (
      <div className={`highlight-arrow highlight-arrow--${direction ? direction : "right"} highlight-arrow--${color ? color : "blue"}`}>
        {direction === "left" || direction === "top" ? (
          <div className="highlight-arrow__triangle"></div>
        ) : null}
        <div className="highlight-arrow__stalk"></div>
        {direction === "right" || direction === "bottom" ? (
          <div className="highlight-arrow__triangle"></div>
        ) : null}
      </div>
    );
  }
}
