import React from 'react';
import { Collapse, Popover } from 'antd';

import { PrettyPrintedJSON, Output, HelpContent, PopoverTarget } from '../tugboat/components';

export interface Props {
    input: {};
    output: {};
    model: {};
}

export const DebugInfo = ({ input, output, model }: Props) => {
    const title = 'Debug Output';
    const helpContent = (
        <HelpContent>
            <p>
                This is the raw request and response.
                The "Output" shows you what AllenNLP would return if you used it on the CLI.
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
