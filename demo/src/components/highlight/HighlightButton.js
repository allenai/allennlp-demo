import React from 'react';
import '../../css/HighlightButton.css';

/*******************************************************************************
  <HighlightButton /> Component
*******************************************************************************/

export default class HighlightButton extends React.Component {
  render() {
    const {         // All fields optional:
      color,        // string (see highlightColors for supported values)
      direction,    // string (supported values: "top", left", "right", "bottom")
      disabled,     // boolean
    } = this.props;

    return (
      <button className={`highlight__button ${direction === "prev" ? "highlight__button--prev" : "highlight__button--next"}`} disabled={disabled}
        title={`${!disabled ? `Show ${direction === "prev" ? "previous" : "next"} item` : ""}`}>
        <span className="highlight__button__body"></span>
        <svg>
          <use xlinkHref="#icon__disclosure"></use>
        </svg>
      </button>
    );
  }
}
