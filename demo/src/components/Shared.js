import styled from 'styled-components';
import * as ReactRadioGroup from 'react-radio-group';
import ReactTooltip from 'react-tooltip';

export const RadioGroup = styled(ReactRadioGroup.RadioGroup)`
  && {
    margin-top: 0;
    label,
    label input {
      margin-top: 0;
      cursor: pointer;
      width: fit-content;
    }

    input[type='radio']:after,
    input[type='radio']:checked:after {
        width: 11px;
        height: 11px;
        border-radius: 11px;
        top: -1px;
        left: -2px;
        position: relative;
        background-color: white;
        content: '';
        display: inline-block;
        visibility: visible;
        border: 2px solid gray;
    }
    input[type='radio']:checked:after {
        background-color: darkGray;
    }
  }
`;

export const Radio = styled(ReactRadioGroup.Radio)`
  margin-right: 5px;
`;

export const Tooltip = styled(ReactTooltip)`
  && {
    &,
    span {
      text-rendering: geometricPrecision;
      font-size: 1em;
      color: white;
      line-height: 1;
    }
  }
`;
