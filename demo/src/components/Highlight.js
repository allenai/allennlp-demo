import React from 'react';

/*******************************************************************************
  <Highlight /> Component
*******************************************************************************/

export const highlightColors = [
  "blue",
  "green",
  "pink",
  "orange",
  "purple",
  "teal",
  "tan",
  "red",
  "cobalt",
  "brown",
  "slate",
  "fuchsia",
  "gray"
];
// Matches an index with a color. If index is greater than number of colors, cycle through colors.
export const getHighlightColor = (index) => {
  if (index <= highlightColors.length) {
    return highlightColors[index];
  } else {
    return highlightColors[index - (highlightColors.length * Math.floor(index / highlightColors.length))];
  }
}

export class Highlight extends React.Component {
  render() {
    const {
      activeDepths,   // object
      activeIds,      // string[] | number[]
      children,       // object | string
      color,          // string (see highlightColors above for supported values)
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
    const conditionalClasses = `highlight
      ${labelPosition ? labelPosition : "bottom"}
      ${color ? color : "blue"}
      ${isClickable ? "clickable" : ""}
      ${selectedId && selectedId === id ? "selected" : ""}
      ${isClicking && activeDepths.ids[deepestIndex] === id ? "clicking active" : ""}
      ${!isClicking && activeIds && activeIds.includes(id) ? "active" : ""}
      ${typeof(children) === "string" && children.length < 8 ? "short-text" : ""}`;

    return (
      <span
        className={conditionalClasses}
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
