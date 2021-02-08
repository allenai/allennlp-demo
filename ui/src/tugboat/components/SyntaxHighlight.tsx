import React from 'react';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

/**
 * <SyntaxHighlight /> Component
 *
 * This component is a wrapper for the `react-syntax-highlighter` component.
 * The goal was to keep the highlight styling consistent and as easy to leverage
 * as possible. This takes the style-related props out of the equation for
 * general use throughout AllenNLP demos. Global code style can be managed here.
 *
 * Documentation for `react-syntax-highlighter` can be found on NPM:
 * https://www.npmjs.com/package/react-syntax-highlighter
 *
 * Supported Languages:
 * https://github.com/conorhastings/react-syntax-highlighter/blob/HEAD/AVAILABLE_LANGUAGES_HLJS.MD
 *
 * Supported Styles:
 * https://github.com/conorhastings/react-syntax-highlighter/blob/HEAD/AVAILABLE_STYLES_HLJS.MD
 *
 * Demo:
 * https://highlightjs.org/static/demo/
 */

export const SyntaxHighlight = ({ language, children }: { language?: string; children: any }) => {
    // Overriding the unwanted inline styles that `react-syntax-highlighter` adds by default:
    const customStyle = {
        background: 'transparent',
    };

    return (
        <StyleOverride>
            <SyntaxHighlighter language={language} style={vs} customStyle={customStyle}>
                {children}
            </SyntaxHighlighter>
        </StyleOverride>
    );
};

const StyleOverride = styled.div`
    background: ${({ theme }) => theme.palette.background.info};
    padding: ${({ theme }) => theme.typography.textStyles.code.padding};
    border: 1px solid ${({ theme }) => theme.palette.border.default};
    font-size: ${({ theme }) => theme.typography.textStyles.code.fontSize};
    overflow-x: auto;
    code {
        border: none;
        background: transparent;
    }
    pre {
        margin: 0;
    }
`;
