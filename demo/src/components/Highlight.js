import React from 'react';

/*******************************************************************************
  <Highlight /> Component
*******************************************************************************/

export default class Highlight extends React.Component {
  render() {
    const {
      activeIds,      // string[] | number[]
      children,       // object | string
      clickable,      // boolean
      color,          // string
      id,             // string | number
      label,          // string
      labelPosition,  // string
      onClick,        // function
      onMouseOver,    // function
      onMouseOut,     // function
      tooltip         // string
    } = this.props;

    return (
      <span
        className={`highlight
          ${labelPosition ? labelPosition : "bottom"}
          ${color ? color : ""}
          ${clickable ? "clickable" : ""}
          ${typeof(children) === "string" && children.length < 8 ? "short-text" : ""}
          ${activeIds && activeIds.includes(id) ? "active" : ""}`
        }
        data-label={label}
        data-id={id}
        onClick={onClick ? () => { onClick(id) } : null}
        onMouseOver={onMouseOver ? () => { onMouseOver(id) } : null}
        onMouseOut={onMouseOut ? () => { onMouseOut(id) } : null}>
        {children}
        {tooltip ? (
          <span className="highlight__tooltip">{tooltip}</span>
        ) : null}
      </span>
    );
  }
}
