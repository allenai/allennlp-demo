import React from 'react';
import { Spin, Icon } from '@allenai/varnish';
import styled from 'styled-components';

class WaitingForPermalink extends React.Component {
    render() {
        return (
            <LoadingContainer>
                <Spin indicator={<Icon type="loading"  style={{ fontSize: '2rem' }} />} />
            </LoadingContainer>
        );
    }
}

const LoadingContainer = styled.div`
    ${({ theme }) => `
        padding: ${theme.spacing.xl};
        font-size: ${theme.typography.bodyJumbo.fontSize};
    `}
`;

export default WaitingForPermalink;
