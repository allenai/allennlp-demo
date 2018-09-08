import React from 'react';

/*******************************************************************************
  <HighlightContainer /> Component

  This is a Wrapper for <Highlight /> that sets
  container CSS classes that get inherited.
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
