import React from 'react';
import styled from 'styled-components';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/github';

export const CodeSnippet = ({ code, language }) => (
    <Highlight
        {...defaultProps}
        code={code}
        theme={theme}
        language={language}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Code className={className} style={style}>
            {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
                ))}
            </div>
            ))}
        </Code>
        )}
    </Highlight>
);

const Code = styled.pre`
    padding: ${({ theme }) => theme.spacing.sm};
    margin: ${({ theme }) => `${theme.spacing.xs} 0 ${theme.spacing.md}`};
`;
