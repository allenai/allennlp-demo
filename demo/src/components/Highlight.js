import React from 'react';

/*******************************************************************************
  <Highlight /> Component
*******************************************************************************/

export default class Highlight extends React.Component {
  render() {
    const {
      activeDepths,   // object
      activeIds,      // string[] | number[]
      children,       // object | string
      color,          // string
      depth,          // number
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
      selectedId,     // string | number
      tooltip         // string
    } = this.props;

    const deepestIndex = activeDepths ? activeDepths.depths.indexOf(Math.max(...activeDepths.depths)) : null;

    return (
      <span
        className={`highlight
          ${labelPosition ? labelPosition : "bottom"}
          ${color ? color : ""}
          ${selectedId && selectedId === id ? "selected" : ""}
          ${isClicking && activeDepths.ids[deepestIndex] === id ? "clicking active" : ""}
          ${isClickable ? "clickable" : ""}
          ${typeof(children) === "string" && children.length < 8 ? "short-text" : ""}
          ${!isClicking && activeIds && activeIds.includes(id) ? "active" : ""}`
        }
        data-label={label}
        data-id={id}
        data-depth={depth}
        onClick={onClick ? () => { onClick(id) } : null}
        onMouseDown={onMouseDown ? () => { onMouseDown(id, depth) } : null}
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
