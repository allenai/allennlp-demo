import React from 'react';
import './Highlight.css';

/*******************************************************************************
  <HighlightContainer /> Component
*******************************************************************************/

export default class HighlightContainer extends React.Component {
  render() {
    const {         // All fields optional:
      children,       // object | string
      isClicking,     // boolean
      layout          // string (supported values: "bottom-labels", null)
    } = this.props;

    const containerClasses = `passage
      model__content__summary
      highlight-container
      ${layout ? "highlight-container--" + layout : ""}
      ${isClicking ? "clicking" : ""}`;

    return (
      <div className={containerClasses}>
        {children}
      </div>
    );
  }
}
