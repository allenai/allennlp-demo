import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/styles/hljs';

export const CodeSnippet = ({ children, language }) => (
    <SyntaxHighlighter language={language} style={github}>
        {children}
    </SyntaxHighlighter>
);
