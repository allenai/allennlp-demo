import styled from 'styled-components';

export const SparkEnvelope = styled.div`
    width: ${({ theme }) => theme.spacing.xl2};
    height: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.palette.background.info};
    margin: ${({ theme }) => `${theme.spacing.xxs} 0`};
    display: inline-block;
`;

export const Spark = styled.div<{ value: number }>`
    background: ${({ theme }) => theme.palette.primary.light};
    width: ${({ value }) => `${Math.max(0, value)}%`};
    height: 100%;
`;

export const SparkValue = styled.div`
    display: inline-block;
    vertical-align: top;
`;
