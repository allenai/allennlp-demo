import React from 'react';
import styled from 'styled-components';
import { Button, Space } from 'antd';

import { ErrorMessage } from './ErrorMessage';

interface ErrorBoundaryViewProps {
    error: Error;
    resetError: () => void;
}

export const ErrorBoundaryView = ({ error, resetError }: ErrorBoundaryViewProps) => {
    const showErrorDetails = process.env.NODE_ENV === 'development';
    const details = showErrorDetails ? (
        <>
            <b>{error.message}:</b>
            <DebugInfo>
                <pre>{error.stack || JSON.stringify(error, null, 2)}</pre>
            </DebugInfo>
        </>
    ) : (
        <>Sorry, something went wrong. Please try again.</>
    );

    const message = (
        <Space direction="vertical">
            <span>{details}</span>
            <Button onClick={resetError}>Reset</Button>
        </Space>
    );

    return <ErrorMessage message={message} />;
};

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

        return (
            <ErrorBoundaryView
                error={this.state.error}
                resetError={() => window.location.reload()}
            />
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
