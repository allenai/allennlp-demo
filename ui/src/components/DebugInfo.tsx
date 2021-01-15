import React from 'react';
import { Collapse } from 'antd';

import { PrettyPrintedJSON, Output } from '../tugboat/components';

export interface Props {
    input: {};
    output: {};
    model: {};
}

export const DebugInfo = ({ input, output, model }: Props) => (
    <>
        {!process.env.prod ? (
            <Output.SubSection title="Debug Output">
                <Collapse>
                    <Collapse.Panel key="model-debug" header="Model">
                        <PrettyPrintedJSON json={model} />
                    </Collapse.Panel>
                    <Collapse.Panel key="input-debug" header="Input">
                        <PrettyPrintedJSON json={input} />
                    </Collapse.Panel>
                    <Collapse.Panel key="output-debug" header="Output">
                        <PrettyPrintedJSON json={output} />
                    </Collapse.Panel>
                </Collapse>
            </Output.SubSection>
        ) : null}
    </>
);
