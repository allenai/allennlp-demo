import styled, { css } from 'styled-components';
import { Input as AntInput, Select as AntSelect } from 'antd';

export const Form = styled.form`
    margin: ${({ theme }) => `0 0 ${theme.spacing.lg}`};
    max-width: 36rem;
`;

export const Field = styled.div`
    margin-top: ${({ theme }) => theme.spacing.md};

    @media (max-height: ${({ theme }) => theme.breakpoints.md}) {
        margin-top: ${({ theme }) => theme.spacing.xs};
    }
`;

export const Label = styled.div`
    margin: ${({ theme }) => `${theme.spacing.sm} 0 ${theme.spacing.xxs} 0`};
`;

const baseInputStyles = css`
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.xs};
    display: block;

    @media (max-height: ${({ theme }) => theme.breakpoints.md}) {
        margin-top: ${({ theme }) => theme.spacing.xxs};
    }
`;

export const TextArea = styled(AntInput.TextArea)`
    && {
        ${baseInputStyles}

        resize: vertical;
        min-height: 5.4em;

        @media (max-height: ${({ theme }) => theme.breakpoints.md}) {
            min-height: 4.4em;
        }
    }
`;

export const Input = styled(AntInput)`
    ${baseInputStyles}
`;

export const Select = styled(AntSelect)`
    ${baseInputStyles}
`;

export const OptDesc = styled.div`
    max-width: ${({ theme }) => theme.breakpoints.md};
    white-space: break-spaces;
`;
