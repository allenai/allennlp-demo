import styled from 'styled-components';
import { Button } from 'antd';

export const Title = styled.h3`
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;

export const Description = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const RunButton = styled(Button).attrs({
    type: 'primary',
})`
    margin-top: ${({ theme }) => theme.spacing.sm};
    margin-right: ${({ theme }) => theme.spacing.md};
`;
