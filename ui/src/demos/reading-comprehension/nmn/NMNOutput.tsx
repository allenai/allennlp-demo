import React from 'react';
import { Tabs } from 'antd';
import { Output } from '@allenai/tugboat/components/form';

import { Explanation } from './Explanation';
import { NMNPrediction, NestedNMNProgram } from '../types';
import { StepOutput } from './StepOutput';

/**
 * Either a single module that represents a single step / frame of the program, or a
 * (potentially nested) array of modules.
 */
interface ProgramExpressionProps {
    program: NestedNMNProgram;
    parentKey?: string;
}

export const ProgramExpression = ({ program, parentKey }: ProgramExpressionProps) => {
    if (Array.isArray(program)) {
        const lastIdx = program.length - 1;
        return (
            <>
                (
                {program.map((p, i) => {
                    const key = parentKey ? `${parentKey}/${i}` : `${i}`;
                    return (
                        <React.Fragment key={key}>
                            <ProgramExpression program={p} parentKey={key} />
                            {i !== lastIdx ? <>&nbsp;</> : null}
                        </React.Fragment>
                    );
                })}
                )
            </>
        );
    } else {
        return (
            <span>
                {program.name}
                <sub>{program.identifier}</sub>
            </span>
        );
    }
};

export const NMNOutput = (response: NMNPrediction) => {
    const explanation = Explanation.fromResponse(response);
    return (
        <>
            <Output.SubSection title="Answer">{explanation.answer}</Output.SubSection>

            <Output.SubSection title="Program">
                <code>
                    <ProgramExpression program={response.program_nested_expression} />
                </code>
            </Output.SubSection>

            <Output.SubSection title="Execution Steps">
                <Tabs animated={false}>
                    {explanation.steps.map((step, index) => (
                        <Tabs.TabPane
                            tab={`${index + 1}. ${step.moduleName}`}
                            key={`${index}-${step.moduleName}`}>
                            <StepOutput inputs={explanation.inputs} step={step} />
                        </Tabs.TabPane>
                    ))}
                </Tabs>
            </Output.SubSection>
        </>
    );
};
