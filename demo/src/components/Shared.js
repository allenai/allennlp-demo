import styled from 'styled-components';
import * as ReactRadioGroup from 'react-radio-group';
import ReactTooltip from 'react-tooltip';

export const RadioGroup = styled(ReactRadioGroup.RadioGroup)`
  && {
    margin-top: 0;
    label,
    label input[type='radio'] {
      margin-top: 0;
      cursor: pointer;
    }

    label {
      display: flex;
      flex-direction: row;
      width: fit-content;
    }

    input[type='radio'] {
      display: flex;
      align-self: flex-end;
      width: 1.455em;
    }

    input[type='radio']:after,
    input[type='radio']:checked:after {
        width: 1em;
        height: 1em;
        border-radius: 1em;
        background-color: white;
        content: '';
        border: 0.182em solid gray;
    }
    input[type='radio']:checked:after {
        background-color: darkGray;
    }
  }
`;

export const Radio = styled(ReactRadioGroup.Radio)`
  && {
    margin-right: 5px;
  }
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
