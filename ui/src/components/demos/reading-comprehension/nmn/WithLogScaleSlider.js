import React from 'react';
import styled from 'styled-components';
import { Col, Row, Slider } from '@allenai/varnish';

import { FormField, FormLabel } from '../../../Form';
import { LogScale } from './LogScale';

/**
 * @param {object}                          props
 * @param {number[]}                        props.values        A tuple containing the actual min and
 *                                                              max values for the range that's to be
 *                                                              log scaled.
 * @param {number[]}                        props.range         A tuple containing the min and max
 *                                                              values for the range that the values
 *                                                              should be scaled to.
 * @param {number}                          props.defaultValue  The default value to be selected.
 * @param {(value: number) => JSX.Element}  props.children      A function that takes the selected value
 *                                                              and returns any resulting output.
 * @param {string}                          props.label         The form label for the slider.
 */
export const WithLogScaleSlider = ({ values, range, defaultValue, children, label }) => {
  const log = new LogScale(range, values);
  const [ value, setSelectedValue ] = React.useState(defaultValue)
  return (
    <React.Fragment>
      <FormField>
        <FormLabel>{label}</FormLabel>
        <Row>
          <ColWithLeftPadding span={12}>
            <Slider
                min={log.range[0]}
                max={log.range[1]}
                step={(log.range[1] - log.range[0]) / 100}
                tipFormatter={v => log.value(v)}
                onChange={v => setSelectedValue(log.value(v))}
                value={log.scale(value)}
                disabled={values.length === 0} />
          </ColWithLeftPadding>
          <Col span={8}>
            {value}
          </Col>
        </Row>
      </FormField>
      {children(value)}
    </React.Fragment>
  );
}

// The slider's slider gets cut off on the left w/o this.
const ColWithLeftPadding = styled(Col)`
  ${({ theme }) => `
    padding-left: ${theme.spacing.xs};
  `}
`;
