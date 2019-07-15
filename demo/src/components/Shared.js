import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';

export const Tooltip = styled(ReactTooltip)`
  && {
    &,
    span {
      text-rendering: geometricPrecision;
      font-size: ${({theme}) => theme.typography.bodySmall.fontSize};
      color: ${({theme}) => theme.typography.bodySmall.contrastColor};
      line-height:  ${({theme}) => theme.typography.bodySmall.lineHeight};
    }
  }
`;
