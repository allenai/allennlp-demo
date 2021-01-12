import React from 'react';
import styled from 'styled-components';
import { Col, Row, Slider } from 'antd';

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
                <Row>
                    <ColWithLeftPadding span={12}>
                        <Slider
                            min={log.range[0]}
                            max={log.range[1]}
                            step={(log.range[1] - log.range[0]) / 100}
                            tipFormatter={(v?: number) =>
                                v !== undefined ? log.value(v) : undefined
                            }
                            onChange={(v: number) => setSelectedValue(log.value(v))}
                            value={log.scale(value)}
                            disabled={!values}
                        />
                    </ColWithLeftPadding>
                    <Col span={8}>{value}</Col>
                </Row>
            </Output.SubSection>
            {children(value)}
        </>
    );
};

// TODO: [jon] Let's use display: grid and gap here instead

// The slider's slider gets cut off on the left w/o this.
const ColWithLeftPadding = styled(Col)`
    ${({ theme }) => `
        padding-left: ${theme.spacing.xs};
  `}
`;
