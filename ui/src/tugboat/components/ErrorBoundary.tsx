import React from 'react';
import styled from 'styled-components';
import { Alert } from 'antd';

interface Props {
    children: React.ReactNode;
}

interface State {
    error?: Error;
}

export class ErrorBoundary extends React.PureComponent<Props, State> {
    state: State = {};
    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        const showErrorDetails = process.env.NODE_ENV === 'development';
        const description = showErrorDetails ? (
            <>
                <b>{this.state.error.message}:</b>
                <DebugInfo>
                    <pre>{this.state.error.stack || JSON.stringify(this.state.error, null, 2)}</pre>
                </DebugInfo>
            </>
        ) : (
            <>Sorry, something went wrong. Please try again.</>
        );

        return (
            <Alert type="error" message="Error" description={description} showIcon />
        );
    }
}

const DebugInfo = styled.code`
    ${({ theme }) => `
        display: block;
        padding: ${theme.spacing.md};
        margin: ${theme.spacing.sm} 0 0;
        overflow: auto;

        pre {
            margin: 0;
            padding: 0;
            overflow: initial;
        }
    `}
`;
