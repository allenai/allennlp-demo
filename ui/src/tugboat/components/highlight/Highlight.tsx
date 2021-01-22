import React from 'react';
import styled, { css } from 'styled-components';
import { Tooltip } from 'antd';

export type Value = string | number;

type LabelPosition = 'top' | 'left' | 'right' | 'bottom';

export interface BaseHighlightProps {
    activeDepths?: { ids: Value[]; depths: number[] };
    activeIds?: Value[];
    isClickable?: boolean;
    isClicking?: boolean;
    labelPosition?: LabelPosition;
    onMouseDown?: (id: Value, depth?: number) => void;
    onMouseOut?: (id: Value) => void;
    onMouseOver?: (id: Value) => void;
    onMouseUp?: (id: Value) => void;
    selectedId?: Value;
}

interface Props extends BaseHighlightProps {
    children: React.ReactNode | JSX.Element;
    color?: HighlightColor;
    depth?: number;
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
    const colorOrDefault = color || 'B';
    const labelPositionOrDefault = labelPosition || (label ? 'bottom' : undefined);
    const isClickingOnDeepestIndex =
        isClicking &&
        activeDepths !== undefined &&
        deepestIndex !== undefined &&
        deepestIndex !== null &&
        activeDepths.ids[deepestIndex] === id;
    const isActiveOrClicking =
        isClickingOnDeepestIndex || (!isClicking && activeIds && activeIds.includes(id));
    const isString = (val: any): val is string => {
        return typeof val === 'string';
    };
    const labelTemplate = (
        <PrimaryLabel color={colorOrDefault} active={isActiveOrClicking}>
            <strong>{label}</strong>
            {secondaryLabel ? <SecondaryLabel>{secondaryLabel}</SecondaryLabel> : null}
        </PrimaryLabel>
    );

    return (
        <HighlightSpan
            color={colorOrDefault}
            labelPosition={labelPositionOrDefault}
            clickable={isClickable}
            selected={selectedId === id}
            clicking={isClickingOnDeepestIndex}
            active={isActiveOrClicking}
            shortText={isString(children) && children.length < 8}
            onClick={onClick ? () => onClick(id) : undefined}
            onMouseDown={onMouseDown ? () => onMouseDown(id, depth) : undefined}
            onMouseOver={onMouseOver ? () => onMouseOver(id) : undefined}
            onMouseOut={onMouseOut ? () => onMouseOut(id) : undefined}
            onMouseUp={onMouseUp ? () => onMouseUp(id) : undefined}>
            <Tooltip title={tooltip}>
                <FlexContainer labelPosition={labelPositionOrDefault}>
                    {label &&
                    (labelPositionOrDefault === 'left' || labelPositionOrDefault === 'top')
                        ? labelTemplate
                        : null}
                    {children ? (
                        <Content labelPosition={labelPositionOrDefault}>{children}</Content>
                    ) : null}
                    {label &&
                    (labelPositionOrDefault === 'right' || labelPositionOrDefault === 'bottom')
                        ? labelTemplate
                        : null}
                </FlexContainer>
            </Tooltip>
        </HighlightSpan>
    );
};

// Highlight is restricted to specific colors since we adjust the background, border, and active
// states with different variants of a single shade. The way this is completed is by using the
// Varnish theme colors.
// When the user says the Highlight should be 'R', internally, we use theme.color['R1'],
// theme.color['R4'], and theme.color['R5'].
const highlightColors = ['B', 'M', 'T', 'P', 'R', 'G', 'A', 'O'] as const;
export type HighlightColor = typeof highlightColors[number];

/**
 * Matches an index with a color. If index is greater than number of colors, cycle through colors.
 */
export const getHighlightColor = (index: number): HighlightColor => {
    return highlightColors[index % highlightColors.length];
};

const FlexContainer = styled.div<{
    labelPosition?: LabelPosition;
}>`
    display: flex;
    flex-direction: ${({ labelPosition }) =>
        labelPosition === 'top' || labelPosition === 'bottom' ? 'column' : null};
`;

const PrimaryLabel = styled.span<{
    labelPosition?: LabelPosition;
    color: string;
    active?: boolean;
}>`
    align-items: center;
    justify-content: center;
    display: flex;
    padding: 0 ${({ theme }) => theme.spacing.xs};
    text-align: center;
    user-select: none;
    background: ${({ theme, color }) => theme.color[color + '4']};
    font-size: ${({ theme }) => theme.typography.textStyles.micro.fontSize};

    strong {
        display: block;
        color: ${({ theme }) => theme.palette.common.white};
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    ${({ labelPosition }) =>
        labelPosition &&
        labelPosition === 'top' &&
        css`
            min-height: 22px;
        `}

    ${({ labelPosition }) =>
        labelPosition &&
        labelPosition === 'bottom' &&
        css`
            /* TODO: lets remove line-height and use flex with align-items */
            line-height: 14px;
            padding-top: 1px;
        `}

    ${({ active, theme, color }) =>
        !active &&
        css`
            background-color: ${theme.color[color + '5']};
        `}
`;

const SecondaryLabel = styled.span`
    display: block;
    color: ${({ theme }) => theme.palette.common.white};
    letter-spacing: 0.1em;
    opacity: 0.75;
    padding-left: ${({ theme }) => theme.spacing.xs2};
    font-size: ${({ theme }) => theme.typography.textStyles.micro.fontSize};
`;

// This, quite complicated, code was ported and tries to maintain functionality.
const Content = styled.span<{ labelPosition?: LabelPosition }>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 2px 2px 2px ${({ theme }) => theme.spacing.xs2};

    &:after {
        ${({ labelPosition }) =>
            labelPosition &&
            labelPosition === 'bottom' &&
            css`
                content: ' ';
                padding-right: ${({ theme }) => theme.spacing.xs2};
            `}
    }
`;

const HighlightSpan = styled.span<{
    labelPosition?: LabelPosition;
    color: string;
    clickable?: boolean;
    selected?: boolean;
    clicking?: boolean;
    active?: boolean;
    shortText?: boolean;
}>`
    border: 2px solid;
    margin: ${({ theme }) =>
        `${theme.spacing.xs2} ${theme.spacing.xs} ${theme.spacing.xs2} ${theme.spacing.xs2}`};
    vertical-align: middle;
    box-shadow: 2px 4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    cursor: default;
    min-width: ${({ theme }) => theme.spacing.lg};
    /* TODO: lets remove line-height and use flex with align-items */
    line-height: 22px;
    display: flex;
    color: ${({ theme }) => theme.palette.text.primary};
    background: ${({ theme, color }) => theme.color[color + '1']};
    border-color: ${({ theme, color }) => theme.color[color + '5']};
    transition: background-color 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;

    &:last-child {
        margin-right: ${({ theme }) => theme.spacing.xs2};
    }

    &:first-child {
        margin-left: 0;
    }

    ${({ labelPosition }) =>
        labelPosition &&
        labelPosition === 'bottom' &&
        css`
            display: block;
            white-space: normal;
        `}

    ${({ labelPosition }) =>
        labelPosition &&
        labelPosition === 'top' &&
        css`
            flex-direction: column;
            white-space: normal;
        `}

    ${({ active, theme, color }) =>
        active &&
        css`
            && {
                color: ${theme.palette.common.white};
                background: ${theme.color[color + '5']};
            }
        `}

    span {
        transition: background-color 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
    }

    ${({ shortText }) =>
        shortText &&
        css`
            text-align: center;
        `}

    ${({ clickable }) =>
        clickable &&
        css`
            cursor: pointer;
        `}

    ${({ clickable, clicking }) =>
        clickable &&
        clicking &&
        css`
            opacity: 0.66;
            transition-duration: 0s;
        `}

        ${({ clicking }) =>
        clicking &&
        css`
            &,
            span,
            &:before,
            &:after {
                transition-duration: 0s;
            }
        `}
`;
