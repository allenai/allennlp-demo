import React from 'react';
import styled from 'styled-components';
import { Collapse, Popover } from 'antd';
import { LinkCSS } from '@allenai/varnish/components';

import { PrettyPrintedJSON, Output } from '../tugboat/components';

export interface Props {
    input: {};
    output: {};
    model: {};
}

export const DebugInfo = ({ input, output, model }: Props) => {
    const title = 'Debug Output';
    const helpContent = (
        <HelpContent>
            <p>This is the raw request and response, that can be used to debug issues with the demo.</p>
        </HelpContent>
    );

    return (
        <Output.Section
            title={title}
            extra={
                <Popover content={helpContent} title={<strong>{title}</strong>}>
                    <PopoverTarget>What is this?</PopoverTarget>
                </Popover>
            }>
            <Collapse>
                <Collapse.Panel key="input-debug" header="Input">
                    <PrettyPrintedJSON json={input} />
                </Collapse.Panel>
                <Collapse.Panel key="model-debug" header="Model">
                    <PrettyPrintedJSON json={model} />
                </Collapse.Panel>
                <Collapse.Panel key="output-debug" header="Output">
                    <PrettyPrintedJSON json={output} />
                </Collapse.Panel>
            </Collapse>
        </Output.Section>
    );
};

const HelpContent = styled.div`
    width: 60ch;

    p {
        margin: 0 0 ${({ theme }) => theme.spacing.sm};
    }
`;

const PopoverTarget = styled.span`
    ${LinkCSS.default()}
    font-style: italic;
`;
