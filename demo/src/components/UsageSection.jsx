import React from 'react';
import styled from 'styled-components';

export const UsageSection = ({ children }) => (
    <WithBottomMargin>{children}</WithBottomMargin>
);

const WithBottomMargin = styled.div`
    margin: 15px 0 30px;
`;
