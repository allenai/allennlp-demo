import React from 'react';
import styled from 'styled-components';
import { Tabs, Tooltip } from 'antd';

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
  const allAttentionValues = inputs.reduce((values, input) => {
    // We only consider values for inputs that exist. Sometimes there's output with no
    // associated input, which we discard as otherwise the scale would include values that
    // aren't visualized.
    const outputs = step.getOutputsForInput(input.name);
    return values.concat(outputs.reduce((v, o) => v.concat(o.values), []));
  }, []).sort((a, b) => a - b);
  const len = allAttentionValues.length;
  const range = [0, 1];
  const defaultValue = len >= 2 ? allAttentionValues[Math.floor(len * 0.95)] : 0.5;
  const values = len >= 2 ? [
    Math.min(0, allAttentionValues[0]),
    Math.max(allAttentionValues[len - 1], 1)
  ] : [ 0, 1 ];
  const nf = Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
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
        inputs.map((input, inputIdx) => {
          const outputs = step.getOutputsForInput(input.name);

          // Don't display inputs that don't have output.
          if (outputs.length === 0) {
            return null;
          }

          // Compute the clutsers that should be highlighted, given the selected minimum
          // attention value.
          const clusters = {};
          // We also prepare a reverse map of values for each out by token index, as to
          // display them in a tooltip that shows when hovering over an individual token.
          const valuesByTokenIndex = {};
          for(const output of outputs) {
            const label = output.label || step.moduleName;
            const spans = [];
            let start = null;
            for(const index in output.values) {
              const value = output.values[index];

              // Show values when hovering a token, regardless of whether it's above the current
              // filter value.
              if (!Array.isArray(valuesByTokenIndex[index])) {
                valuesByTokenIndex[index] = [];
              }
              valuesByTokenIndex[index].push({ label, value });

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
            <OutputField key={`${inputIdx}/${input.name}`} label={input.name}>
              <SpacingFix>
                <NestedHighlight
                    tokens={input.tokens.map((t, i) => {
                      const valuesForIdx = valuesByTokenIndex[i];

                      // If there's no values for this token then don't wrap it in a <Tooltip />.
                      if (!Array.isArray(valuesForIdx) || valuesForIdx.length === 0) {
                        return t;
                      }

                      // Show a tooltip with the values for each token on hover.
                      const title = (
                        <>
                          {valuesForIdx.map(({ label, value }, i) => (
                            <div key={`${i}/${label}`}>
                              {label}: {nf.format(value)}
                            </div>
                          ))}
                        </>
                      );
                      return <Tooltip key={`${i}/${t}`} title={title}>{t}</Tooltip>;
                    })}
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
