import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';

import OutputField from '../../../OutputField';

import NestedHighlight from '../../../highlight/NestedHighlight';
import { ModuleInfo } from './ModuleInfo';
import * as expln from './Explanation';
import { WithLogScaleSlider } from './WithLogScaleSlider';

/**
 * @param {object}  props
 * @param {expln.Input[]} props.inputs
 * @param {expln.Step}    props.step
 */
export const StepOutput = ({ inputs, step }) => {
  const moduleInfo = ModuleInfo.findInfoByName(step.moduleName);
  const allAttentionValues = step.getAllOutputAttentionValues().sort((a, b) => a - b);
  const len = allAttentionValues.length;
  const defaultValue = allAttentionValues[Math.floor(len * 0.95)];
  const range = [0, 1];
  const values = [
    Math.min(0, allAttentionValues[0]),
    Math.max(allAttentionValues[len - 1], 1)
  ];
  return (
    <>
      {moduleInfo ? (
        <Info>
          <strong>{moduleInfo.signature}</strong> {moduleInfo.description}
        </Info>
      ) : null}
      <WithLogScaleSlider
          label="Minimum Attention"
          range={range}
          values={values}
          defaultValue={defaultValue}>{min => (
        inputs.map((input, index) => {
          const outputs = step.getOutputsForInput(input.name);

          // Compute the clutsers that should be highlighted, given the selected minimum
          // attention value.
          const clusters = {};
          for(const output of outputs) {
            const label = output.label || step.moduleName;
            const spans = [];
            let start = null;
            for(const index in output.values) {
              const value = output.values[index];
              if (value >= min) {
                // Starting a new cluster
                if (start === null) {
                  start = index;
                }
              } else {
                // Ending the current cluster
                if (start !== null) {
                  spans.push([ start, index - 1 ]);
                  start = null;
                }
              }
            }
            if (Array.isArray(clusters[label])) {
              clusters[label] = clusters[label].concat(spans);
            } else {
              clusters[label] = spans;
            }
          }
          return (
            <OutputField key={`${index}-${input.name}`} label={input.name}>
              <SpacingFix>
                <NestedHighlight
                    tokens={input.tokens}
                    clusters={clusters}
                    highlightColor={moduleInfo.color} />
              </SpacingFix>
            </OutputField>
          );
        })
      )}</WithLogScaleSlider>
    </>
  );
}

/**
 * @param {object} props
 * @param {object} props.response The raw response from the inference API.
 */
export const Output = ({ response }) => {
  const explanation = expln.Explanation.fromResponse(response);
  return (
    <React.Fragment>
      <OutputField label="Answer">{explanation.answer}</OutputField>
      <OutputField label="Program">
        <code>{explanation.lisp}</code>
      </OutputField>
      <OutputField label="Execution Steps">
        <Tabs animated={false}>
          {explanation.steps.map((step, index) =>
            <Tabs.TabPane
                tab={`${index + 1}. ${step.moduleName}`}
                key={`${index}-${step.moduleName}`}>
              <StepOutput inputs={explanation.inputs} step={step} />
            </Tabs.TabPane>
          )}
          <Tabs.TabPane tab={<code>DEBUG</code>} key="debug">
            <RawResponse>
              <pre>{JSON.stringify(response, null, 4)}</pre>
            </RawResponse>
          </Tabs.TabPane>
        </Tabs>
      </OutputField>
    </React.Fragment>
  );
}

const RawResponse = styled.code`
  ${({ theme }) => `
    display: block;
    border-radius: 4px;
    background: ${theme.color.A10};
    border: 1px solid ${theme.color.B10};
    color: ${theme.color.T4};
    padding: ${theme.spacing.md};
    white-space: wrap;

    pre {
      margin: 0;
    }
  `}
`;

const Info = styled.div`
  ${({ theme }) => `
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.palette.border.info};
    border-radius: 4px;
    background: ${theme.palette.background.info};
    color: ${theme.palette.text.info};
    margin: 0 0 ${theme.spacing.md};
  `}
`;

const SpacingFix = styled.div`
  .model__content__summary {
    margin: 0;
    padding: 0;
  }
`;
