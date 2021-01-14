import React from 'react';
import styled from 'styled-components';
import { Slider } from 'antd';

import { Output } from './form';
import { LogScale } from '../lib/LogScale';

interface Props {
    // The actual min and max values for the range that's to be log scaled.
    values?: [number, number];
    // The min and max values for the range that the values should be scaled to.
    range: [number, number];
    // The default value to be selected.
    defaultValue: number;
    // A function that takes the selected value and returns any resulting output.
    children: (value: number) => JSX.Element | JSX.Element[];
    // The form label for the slider.
    label: string;
}

export const WithLogScaleSlider = ({ values, range, defaultValue, children, label }: Props) => {
    const log = new LogScale(range, values || [0, 1]);
    const [value, setSelectedValue] = React.useState(defaultValue);
    return (
        <>
            <Output.SubSection title={label}>
                <Wrapper>
                    <Slider
                        min={log.range[0]}
                        max={log.range[1]}
                        step={(log.range[1] - log.range[0]) / 100}
                        tipFormatter={(v?: number) => (v !== undefined ? log.value(v) : undefined)}
                        onChange={(v: number) => setSelectedValue(log.value(v))}
                        value={log.scale(value)}
                        disabled={!values}
                    />
                    <span>
                        {Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 }).format(value)}
                    </span>
                </Wrapper>
            </Output.SubSection>
            {children(value)}
        </>
    );
};

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 2fr;
    padding-left: ${({ theme }) => theme.spacing.xs};
`;
