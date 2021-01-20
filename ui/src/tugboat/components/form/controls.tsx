import styled, { css } from 'styled-components';
import { Button, Input as AntInput, Select as AntSelect, Form as AntForm } from 'antd';

export const FieldItem = styled(AntForm.Item)`
    margin-top: ${({ theme }) => theme.spacing.md};

    @media (max-height: ${({ theme }) => theme.breakpoints.md}) {
        margin-top: ${({ theme }) => theme.spacing.xs};
    }
`;

const baseInputStyles = css`
    width: 100%;
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

export const Submit = styled(Button).attrs(() => ({
    type: 'primary',
    htmlType: 'submit',
}))`
    margin-top: ${({ theme }) => theme.spacing.sm};
    margin-right: ${({ theme }) => theme.spacing.md};
`;
