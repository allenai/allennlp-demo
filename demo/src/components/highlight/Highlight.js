import React from 'react';
import '../../css/Highlight.css';

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
    const {         // All fields optional:
      activeDepths,   // object
      activeIds,      // string[] | number[]
      children,       // object | string
      color,          // string (see highlightColors above for supported values)
      depth,          // number
      id,             // string | number
      isClickable,    // boolean
      isClicking,     // boolean
      label,          // string
      labelPosition,  // string (supported values: "top", "left", "right", "bottom")
      onClick,        // function
      onMouseDown,    // function
      onMouseOver,    // function
      onMouseOut,     // function
      onMouseUp,      // function
      selectedId,     // string | number
      secondaryLabel, // string
      tooltip         // string
    } = this.props;

    const deepestIndex = activeDepths ? activeDepths.depths.indexOf(Math.max(...activeDepths.depths)) : null;
    const conditionalClasses = `highlight
      ${labelPosition ? labelPosition : label ? "bottom" : ""}
      ${color ? color : "blue"}
      ${isClickable ? "clickable" : ""}
      ${selectedId && selectedId === id ? "selected" : ""}
      ${isClicking && activeDepths.ids[deepestIndex] === id ? "clicking active" : ""}
      ${!isClicking && activeIds && activeIds.includes(id) ? "active" : ""}
      ${typeof(children) === "string" && children.length < 8 ? "short-text" : ""}`;

    const labelTemplate = (
      <span className="highlight__label">
        <strong>{label}</strong>
        {secondaryLabel ? (
          <span className="highlight__label__secondary-label">{secondaryLabel}</span>
        ) : null}
      </span>
    );

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
        {(labelPosition === "left" || labelPosition === "top") ? labelTemplate : null}
        {children ? (
          <span className="highlight__content">{children}</span>
        ) : null}
        {(label || label !== null) && (labelPosition !== "left" && labelPosition !== "top") ? labelTemplate : null}
        {tooltip ? (
          <span className="highlight__tooltip">{tooltip}</span>
        ) : null}
      </span>
    );
  }
}
