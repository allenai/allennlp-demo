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

export const ColorizedToken = styled.span`
  background-color: ${props => props.backgroundColor};
  padding: 1px;
  margin: 1px;
  display: inline-block;
  border-radius: 3px;
  font-weight: normal;
`;

// red token used to represent deletion in InputReduction and replacement in HotFlip
export const RedToken = styled.span`
  background-color: #FF5733;
  padding: 1px;
  margin: 1px;
  display: inline-block;
  border-radius: 3px;
  font-weight: normal;
`;

// green token used to represent addition in HotFlip
export const GreenToken = styled.span`
  background-color: #26BD19;
  padding: 1px;
  margin: 1px;
  display: inline-block;
  border-radius: 3px;
  font-weight: normal;
`;

// green token used to represent addition in HotFlip
export const TransparentToken = styled.span`
  background-color: "transparent";
  padding: 1px;
  margin: 1px;
  display: inline-block;
  border-radius: 3px;
  font-weight: normal;
`;

// all white (the UI doesn't display it) token used in InputReduction to show removal
export const BlankToken = styled.span`
  background-color: transparent;
  color: white;
  padding: 1px;
  margin: 1px;
  display: inline-block;
  border-radius: 3px;
`;