import React from 'react';
import '../../css/HighlightButton.css';

/*******************************************************************************
  <HighlightButton /> Component

  This component adds a carousl navigation button to a highlight structure.
  For example, see Event2Mind diagram visualization.

*******************************************************************************/

export default class HighlightButton extends React.Component {
  render() {
    const {         // All fields optional:
      direction,    // string (supported values: "prev", "next")
      disabled,     // boolean
      onClick,      // function
    } = this.props;

    return (
      <button
        className={`highlight__button ${direction === "prev" ? "highlight__button--prev" : "highlight__button--next"}`}
        disabled={disabled}
        onClick={onClick ? () => { onClick(direction) } : null}
        title={`${!disabled ? `Show ${direction === "prev" ? "previous" : "next"} item` : ""}`}>
        <span className="highlight__button__body"></span>
        <svg>
          <use xlinkHref="#icon__disclosure"></use>
        </svg>
      </button>
    );
  }
}
