import React from 'react';
import styled from 'styled-components';

export type Value = string | number;

// TODO: [jon 1] classname
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

export interface BaseHighlightProps {
    activeDepths?: { ids: Value[]; depths: number[] };
    activeIds?: Value[];
    isClickable?: boolean;
    isClicking?: boolean;
    labelPosition?: 'top' | 'left' | 'right' | 'bottom';
    onMouseDown?: (id: Value, depth: number) => void;
    onMouseOut?: (id: Value) => void;
    onMouseOver?: (id: Value) => void;
    onMouseUp?: (id: Value) => void;
    selectedId?: Value;
}

interface Props extends BaseHighlightProps {
    children: React.ReactNode | JSX.Element;
    color?: HighlightColor;
    depth: number;
    id: Value;
    label?: string;
    onClick?: (id: Value) => void;
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
    // TODO: [jon 1] classname
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

    // TODO: [jon 1] classname
    const labelTemplate = (
        <span className="highlight__label">
            <strong>{label}</strong>
            {secondaryLabel ? (
                <span className="highlight__label__secondary-label">{secondaryLabel}</span>
            ) : null}
        </span>
    );

    // TODO: [jon 1] classname
    return (
        <HighlightSpan
            className={conditionalClasses}
            data-label={label}
            data-id={id}
            data-depth={depth}
            onClick={onClick ? () => onClick(id) : undefined}
            onMouseDown={onMouseDown ? () => onMouseDown(id, depth) : undefined}
            onMouseOver={onMouseOver ? () => onMouseOver(id) : undefined}
            onMouseOut={onMouseOut ? () => onMouseOut(id) : undefined}
            onMouseUp={onMouseUp ? () => onMouseUp(id) : undefined}>
            {labelPosition === 'left' || labelPosition === 'top' ? labelTemplate : null}
            {children ? <span className="highlight__content">{children}</span> : null}
            {(label || label !== null) && labelPosition !== 'left' && labelPosition !== 'top'
                ? labelTemplate
                : null}
            {tooltip ? <span className="highlight__tooltip">{tooltip}</span> : null}
        </HighlightSpan>
    );
};

const highlightColors = [
    // TODO: [jon 2] use varnish colors
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
] as const;
export type HighlightColor = typeof highlightColors[number];

/**
 * Matches an index with a color. If index is greater than number of colors, cycle through colors.
 */
export const getHighlightColor = (index: number): HighlightColor => {
    return highlightColors[index % highlightColors.length];
};

/*
    ${labelPosition || (label ? 'bottom' : '')}
    ${color || 'blue'}
    ${isClickable ? 'clickable' : ''}
    ${selectedId && selectedId === id ? 'selected' : ''}
    ${isClicking && activeDepths.ids[deepestIndex] === id ? 'clicking active' : ''}
    ${!isClicking && activeIds && activeIds.includes(id) ? 'active' : ''}
    ${typeof children === 'string' && children.length < 8 ? 'short-text' : ''}`;
    */

const HighlightSpan = styled.span`
    .highlight {
        border: 2px solid;
        color: #232323;
        margin: 4px 6px 4px 3px;
        vertical-align: middle;
        box-shadow: 2px 4px 20px rgba(0, 0, 0, 0.1);
        position: relative;
        cursor: default;
        min-width: 26px;
        line-height: 22px;
        display: flex;
    }

    .highlight:last-child {
        margin-right: 4px;
    }

    .highlight:first-child {
        margin-left: 0;
    }

    .highlight,
    .highlight span {
        transition: background-color 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
    }

    .highlight.short-text {
        text-align: center;
    }

    .highlight__label {
        align-items: center;
        justify-content: center;
        display: flex;
        padding: 0 8px;
        text-align: center;
        user-select: none;
    }

    .highlight__label strong,
    .highlight__label span.highlight__label__secondary-label {
        display: block;
        font-size: 11px;
        color: #fff;
        -webkit-font-smoothing: subpixel-antialiased;
        letter-spacing: 0.1em;
    }

    .highlight__label strong {
        text-transform: uppercase;
    }

    .highlight__label span.highlight__label__secondary-label {
        opacity: 0.75;
        padding-left: 6px;
    }

    .highlight__content {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 2px 2px 2px 6px;
    }

    /* Bottom Label Layout */

    .highlight-container.highlight-container--bottom-labels .highlight.bottom {
        margin-top: 6px;
    }

    .highlight.bottom {
        display: block;
        white-space: normal;
    }

    .highlight.bottom .highlight__content:after {
        content: ' ';
        padding-right: 3px;
    }

    .highlight.bottom .highlight__label {
        line-height: 14px;
        padding-top: 1px;
    }

    /* Top Label Layout */

    .highlight.top {
        flex-direction: column;
        white-space: normal;
    }

    .highlight.top .highlight__label {
        min-height: 22px;
    }

    /* Interactions */

    .highlight.active,
    .highlight.active span {
        color: #fff;
    }

    .highlight.active .highlight:not(.active) span {
        color: #232323;
    }

    .highlight.clickable {
        cursor: pointer;
    }

    .highlight.clickable.clicking {
        opacity: 0.66;
        transition-duration: 0s;
    }

    .clicking .highlight,
    .clicking .highlight span,
    .clicking .highlight:before,
    .clicking .highlight:after {
        transition-duration: 0s;
    }

    /* Gray (Default) */

    .highlight.gray {
        background: #f2f4f6;
    }

    .highlight.gray {
        border-color: #a0aab5;
    }

    .highlight.gray .highlight__label {
        background-color: #a0aab5;
    }

    .highlight.gray.active {
        background: #a0aab5;
    }

    .highlight.gray.active .highlight__label {
        background-color: #aab3bd;
    }

    /* Blue */

    .highlight.blue {
        background: #edf4fa;
    }

    .highlight.blue {
        border-color: #4db1f7;
    }

    .highlight.blue > .highlight__label {
        background-color: #4db1f7;
    }

    .highlight.blue.active {
        background: #4db1f7;
    }

    .highlight.blue.active > .highlight__label {
        background-color: #5fb9f8;
    }

    /* Green */

    .highlight.green {
        background: #f1f4f1;
    }

    .highlight.green {
        border-color: #90ac4e;
    }

    .highlight.green > .highlight__label {
        background-color: #90ac4e;
    }

    .highlight.green.active {
        background: #90ac4e;
    }

    .highlight.green.active > .highlight__label {
        background-color: #9bb460;
    }

    /* Pink */

    .highlight.pink {
        background: #f4f1f4;
    }

    .highlight.pink {
        border-color: #ce6587;
    }

    .highlight.pink > .highlight__label {
        background-color: #ce6587;
    }

    .highlight.pink.active {
        background: #ce6587;
    }

    .highlight.pink.active > .highlight__label {
        background-color: #d37593;
    }

    /* Orange */

    .highlight.orange {
        background: #f2f4f4;
    }

    .highlight.orange {
        border-color: #dd9e3e;
    }

    .highlight.orange > .highlight__label {
        background-color: #dd9e3e;
    }

    .highlight.orange.active {
        background: #dd9e3e;
    }

    .highlight.orange.active > .highlight__label {
        background-color: #e0a852;
    }

    /* Purple */

    .highlight.purple {
        background: #f1f0f7;
    }

    .highlight.purple {
        border-color: #9a5eba;
    }

    .highlight.purple > .highlight__label {
        background-color: #9a5eba;
    }

    .highlight.purple.active {
        background: #9a5eba;
    }

    .highlight.purple.active > .highlight__label {
        background-color: #a46ec1;
    }

    /* Teal */

    .highlight.teal {
        background: #eef4f6;
    }

    .highlight.teal {
        border-color: #5bb1ad;
    }

    .highlight.teal > .highlight__label {
        background-color: #5bb1ad;
    }

    .highlight.teal.active {
        background: #5bb1ad;
    }

    .highlight.teal.active > .highlight__label {
        background-color: #6cb9b5;
    }

    /* Tan */

    .highlight.tan {
        background: #f2f4f4;
    }

    .highlight.tan {
        border-color: #b0a481;
    }

    .highlight.tan > .highlight__label {
        background-color: #b0a481;
    }

    .highlight.tan.active {
        background: #b0a481;
    }

    .highlight.tan.active > .highlight__label {
        background-color: #b8ad8e;
    }

    /* Red */

    .highlight.red {
        background: #f5eef0;
    }

    .highlight.red {
        border-color: #df3838;
    }

    .highlight.red > .highlight__label {
        background-color: #df3838;
    }

    .highlight.red.active {
        background: #df3838;
    }

    .highlight.red.active > .highlight__label {
        background-color: #e24c4c;
    }

    /* Cobalt */

    .highlight.cobalt {
        background: #eef0f5;
    }

    .highlight.cobalt {
        border-color: #5f5b97;
    }

    .highlight.cobalt > .highlight__label {
        background-color: #5f5b97;
    }

    .highlight.cobalt.active {
        background: #5f5b97;
    }

    .highlight.cobalt.active > .highlight__label {
        background-color: #6f6ca2;
    }

    /* Brown */

    .highlight.brown {
        background: #f2f4f6;
    }

    .highlight.brown {
        border-color: #6a4e3d;
    }

    .highlight.brown > .highlight__label {
        background-color: #6a4e3d;
    }

    .highlight.brown.active {
        background: #6a4e3d;
    }

    .highlight.brown.active > .highlight__label {
        background-color: #796051;
    }

    /* Slate */

    .highlight.slate {
        background: #eceff1;
    }

    .highlight.slate {
        border-color: #3b4247;
    }

    .highlight.slate > .highlight__label {
        background-color: #3b4247;
    }

    .highlight.slate.active {
        background: #3b4247;
    }

    .highlight.slate.active > .highlight__label {
        background-color: #4f555a;
    }

    /* Fuchsia */

    .highlight.fuchsia {
        background: #f5f1f9;
    }

    .highlight.fuchsia {
        border-color: #e875e8;
    }

    .highlight.fuchsia > .highlight__label {
        background-color: #e875e8;
    }

    .highlight.fuchsia.active {
        background: #e875e8;
    }

    .highlight.fuchsia.active > .highlight__label {
        background-color: #ea83ea;
    }

    /* Tooltip */

    .highlight__tooltip {
        display: block;
        position: absolute;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        background: rgba(70, 70, 70, 0.9);
        padding: 4px 9px 5px 9px;
        opacity: 0;
        z-index: -9;
        left: 50%;
        top: 100%;
        margin-top: 10px;
        font-size: 14px;
        color: #fff;
        transform: translate(-50%, -6px);
        transition: opacity 0.2s ease, z-index 0.2s ease, transform 0.2s ease 0.3s;
        font-weight: bold;
        white-space: nowrap;
        user-select: none;
        cursor: default;
    }

    .highlight__tooltip:before {
        display: block;
        position: absolute;
        left: 50%;
        top: 0;
        margin-top: -6px;
        margin-left: -6px;
        content: '';
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 6px 6px 6px;
        border-color: transparent transparent rgba(70, 70, 70, 0.9) transparent;
    }

    .highlight:hover .highlight__tooltip {
        z-index: 9;
        opacity: 1;
        transform: translate(-50%, 0);
        transition-delay: 0s;
    }

    .highlight__tooltip:hover {
        z-index: -9 !important;
    }
`;
