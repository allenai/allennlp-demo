import React from 'react';
import styled from 'styled-components';
import { Collapse, Popover } from 'antd';
import { SyntaxHighlight, Output, HelpContent, PopoverTarget } from '@allenai/tugboat/components';

export interface Props {
    input: {};
    output: {};
    model: {};
}

export const DebugInfo = ({ input, output, model }: Props) => {
    const title = 'CLI Output';
    const helpContent = (
        <HelpContent>
            <p>
                This is the raw request and response. The "Output" shows you what AllenNLP would
                return if you used it on the CLI.
            </p>
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
            <NoOverflowCollapse>
                <Collapse.Panel key="input-debug" header="Input">
                    <SyntaxHighlight language="json">
                        {JSON.stringify(input, null, 2)}
                    </SyntaxHighlight>
                </Collapse.Panel>
                <Collapse.Panel key="model-debug" header="Model">
                    <SyntaxHighlight language="json">
                        {JSON.stringify(model, null, 2)}
                    </SyntaxHighlight>
                </Collapse.Panel>
                <Collapse.Panel key="output-debug" header="Output">
                    <SyntaxHighlight language="json">
                        {JSON.stringify(output, null, 2)}
                    </SyntaxHighlight>
                </Collapse.Panel>
            </NoOverflowCollapse>
        </Output.Section>
    );
};

const NoOverflowCollapse = styled(Collapse)`
    overflow: auto;
`;
