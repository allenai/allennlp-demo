import React from 'react';

// TODO
export const getHighlightConditionalClasses = (conditions: any) => {
    const {
        labelPosition,
        label,
        color,
        isClickable,
        selectedId,
        isClicking,
        id,
        activeDepths,
        deepestIndex,
        activeIds,
        children,
    } = conditions;
    return `highlight
    ${labelPosition || (label ? 'bottom' : '')}
    ${color || 'blue'}
    ${isClickable ? 'clickable' : ''}
    ${selectedId && selectedId === id ? 'selected' : ''}
    ${isClicking && activeDepths.ids[deepestIndex] === id ? 'clicking active' : ''}
    ${!isClicking && activeIds && activeIds.includes(id) ? 'active' : ''}
    ${typeof children === 'string' && children.length < 8 ? 'short-text' : ''}`;
};

interface Props {
    activeDepths?: { ids: (string | number)[]; depths: number[] };
    activeIds?: (string | number)[] | number[];
    children?: object | string;
    color?: HighlightColors;
    depth: number;
    id: string | number;
    isClickable?: boolean;
    isClicking?: boolean;
    label?: string;
    labelPosition?: 'top' | 'left' | 'right' | 'bottom';
    onClick?: Function; // TODO: [jon] function
    onMouseDown?: (id: string | number, depth: number) => void;
    onMouseOut?: (id: string | number) => void;
    onMouseOver?: (id: string | number) => void;
    onMouseUp?: (id: string | number) => void;
    selectedId?: string | number;
    secondaryLabel?: string;
    tooltip?: string;
}

export const Highlight = ({
    activeDepths,
    activeIds,
    children,
    color,
    depth,
    id,
    isClickable,
    isClicking,
    label,
    labelPosition,
    onClick,
    onMouseDown,
    onMouseOver,
    onMouseOut,
    onMouseUp,
    selectedId,
    secondaryLabel,
    tooltip,
}: Props) => {
    const deepestIndex = activeDepths
        ? activeDepths.depths.indexOf(Math.max(...activeDepths.depths))
        : null;
    const conditionalClasses = getHighlightConditionalClasses({
        labelPosition,
        label,
        color,
        isClickable,
        selectedId,
        isClicking,
        id,
        activeDepths,
        deepestIndex,
        activeIds,
        children,
    });

    // TODO: [jon] classname
    const labelTemplate = (
        <span className="highlight__label">
            <strong>{label}</strong>
            {secondaryLabel ? (
                <span className="highlight__label__secondary-label">{secondaryLabel}</span>
            ) : null}
        </span>
    );

    // TODO: [jon] classname
    return (
        <span
            className={conditionalClasses}
            data-label={label}
            data-id={id}
            data-depth={depth}
            onClick={
                onClick
                    ? () => {
                          onClick(id);
                      }
                    : undefined
            }
            onMouseDown={
                onMouseDown
                    ? () => {
                          onMouseDown(id, depth);
                      }
                    : undefined
            }
            onMouseOver={
                onMouseOver
                    ? () => {
                          onMouseOver(id);
                      }
                    : undefined
            }
            onMouseOut={
                onMouseOut
                    ? () => {
                          onMouseOut(id);
                      }
                    : undefined
            }
            onMouseUp={
                onMouseUp
                    ? () => {
                          onMouseUp(id);
                      }
                    : undefined
            }>
            {labelPosition === 'left' || labelPosition === 'top' ? labelTemplate : null}
            {children ? <span className="highlight__content">{children}</span> : null}
            {(label || label !== null) && labelPosition !== 'left' && labelPosition !== 'top'
                ? labelTemplate
                : null}
            {tooltip ? <span className="highlight__tooltip">{tooltip}</span> : null}
        </span>
    );
};

export enum HighlightColors { // TODO: [jon] use varnish colors
    'blue',
    'green',
    'pink',
    'orange',
    'purple',
    'teal',
    'tan',
    'red',
    'cobalt',
    'brown',
    'slate',
    'fuchsia',
    'gray',
}

/**
 * Matches an index with a color. If index is greater than number of colors, cycle through colors.
 * @param {number} index
 */
export const getHighlightColor = (index: number): HighlightColors => {
    return HighlightColors[
        HighlightColors[index % Object.keys(HighlightColors).length] as keyof typeof HighlightColors
    ];
};
