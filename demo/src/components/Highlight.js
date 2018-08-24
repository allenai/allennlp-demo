import React from 'react';

/*******************************************************************************
  <Highlight /> Component
*******************************************************************************/

export default class Highlight extends React.Component {
  render() {
    const {
      activeIds,      // string[] | number[]
      children,       // object | string
      color,          // string
      id,             // string | number
      isClickable,    // boolean
      isClicking,     // boolean
      label,          // string
      labelPosition,  // string
      onClick,        // function
      onMouseDown,    // function
      onMouseOver,    // function
      onMouseOut,     // function
      onMouseUp,      // function
      tooltip         // string
    } = this.props;

    return (
      <span
        className={`highlight
          ${labelPosition ? labelPosition : "bottom"}
          ${color ? color : ""}
          ${isClicking && activeIds && activeIds.includes(id) ? "clicking" : ""}
          ${isClickable ? "clickable" : ""}
          ${typeof(children) === "string" && children.length < 8 ? "short-text" : ""}
          ${activeIds && activeIds.includes(id) ? "active" : ""}`
        }
        data-label={label}
        data-id={id}
        onClick={onClick ? () => { onClick(id) } : null}
        onMouseDown={onMouseDown ? () => { onMouseDown(id) } : null}
        onMouseOver={onMouseOver ? () => { onMouseOver(id) } : null}
        onMouseOut={onMouseOut ? () => { onMouseOut(id) } : null}
        onMouseUp={onMouseUp ? () => { onMouseUp(id) } : null}>
        {children}
        {tooltip ? (
          <span className="highlight__tooltip">{tooltip}</span>
        ) : null}
      </span>
    );
  }
}
