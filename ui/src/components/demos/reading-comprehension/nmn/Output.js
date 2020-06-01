import React from 'react';
import styled from 'styled-components';
import { Tabs, Popover } from '@allenai/varnish';

import OutputField from '../../../OutputField';
import NestedHighlight, { getHighlightColor } from '../../../highlight/NestedHighlight';

import { ModuleInfo, DEFAULT_MIN_ATTN } from './ModuleInfo';
import * as expln from './Explanation';
import { WithLogScaleSlider } from './WithLogScaleSlider';

/**
 * @param {object}  props
 * @param {expln.Input[]} props.inputs
 * @param {expln.Step}    props.step
 */
export const StepOutput = ({ inputs, step }) => {
  const moduleInfo = ModuleInfo.findInfoByName(step.moduleName);
  const range = [0, 1];
  const values = [ 1e-8, 1 ];
  const nf = Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });

  // We'll be displaying outputs across different inputs, and would like their color to be
  // consistent from one input to another.
  const highlightColorByLabel = {};
  let colorIdx = -1;
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
          defaultValue={moduleInfo.defaultMinAttn || DEFAULT_MIN_ATTN}>{min => (
        inputs.map((input, inputIdx) => {
          const outputs = step.getOutputsForInput(input.name);

          // We merge spans in the passage and question, but not elsewhere.
          const shouldMergeSpans = input.name === 'question' || input.name === 'passage';
          // Compute the clusters that should be highlighted, given the selected minimum
          // attention value.
          const clusters = {};
          // We also prepare a reverse map of values for each out by token index, as to
          // display them in a tooltip that shows when hovering over an individual token.
          const valuesByTokenIndex = {};

          for(const output of outputs) {
            const label = output.label || step.moduleName;

            if (highlightColorByLabel[label] === undefined) {
              highlightColorByLabel[label] = getHighlightColor(++colorIdx);
            }

            const spans = [];
            const lenValues = output.values.length;
            let start = null;
            for(const rawIdx in output.values) {
              // When we iterate through the indices in this fashion in JavaScript, each index
              // is a string. Convert it to an integer so things work as expected.
              const index = parseInt(rawIdx);
              const value = output.values[index];

              // Show values when hovering a token, regardless of whether it's above the current
              // filter value.
              if (!Array.isArray(valuesByTokenIndex[index])) {
                valuesByTokenIndex[index] = [];
              }
              valuesByTokenIndex[index].push({ label, value });

              if (shouldMergeSpans) {
                if (value >= min) {
                  // Starting a new cluster
                  if (start === null) {
                    start = index;
                  }

                  // If we're on the last item, and it's active, and a span is currently open
                  // we need to close it.
                  if (index === lenValues - 1 && start !== null) {
                    spans.push([ start, index ]);
                    start = null;
                  }
                } else {
                  // Ending the current cluster
                  if (start !== null) {
                    spans.push([ start, index - 1 ]);
                    start = null;
                  }
                }
              } else {
                if (value >= min) {
                  spans.push([ index, index ]);
                }
              }
            }
            if (Array.isArray(clusters[label])) {
              clusters[label] = clusters[label].concat(spans);
            } else {
              clusters[label] = spans;
            }
          }

          // For outputs that aren't the question or passage, use a custom token separator
          const tokenSeparator = (
            input.name === 'question' || input.name === 'passage'
              ? undefined
              : <>,&nbsp;</>
          );

          return (
            <OutputField key={`${inputIdx}/${input.name}`} label={input.name}>
              <SpacingFix>
                <NestedHighlight
                    highlightColor={token => highlightColorByLabel[token.cluster]}
                    tokens={input.tokens.map((t, i) => {
                      const valuesForIdx = valuesByTokenIndex[i];

                      // If there's no values for this token then don't wrap it in a <Popover />.
                      if (!Array.isArray(valuesForIdx) || valuesForIdx.length === 0) {
                        return t;
                      }

                      // Show a tooltip with the values for each token on hover.
                      const content = (
                        <>
                          {valuesForIdx.map(({ label, value }, i) => (
                            <div key={`${i}/${label}`}>
                              <strong>{label}:</strong>&nbsp;{nf.format(value)}
                            </div>
                          ))}
                        </>
                      );

                      return <Popover key={`${i}/${t}`} title={t} content={content}>{t}</Popover>;
                    })}
                    clusters={clusters}
                    tokenSeparator={tokenSeparator} />
              </SpacingFix>
            </OutputField>
          );
        })
      )}</WithLogScaleSlider>
    </>
  );
}

/**
 *
 * @param {object|[]} program             Either a single module that represents a single step / frame
 *                                        of the program, or a (potentially nested) array of modules.
 * @param {string}    program.name
 * @param {string}    program.identifier
 */
export const ProgramExpression = ({ program, parentKey }) => {
  if (Array.isArray(program)) {
    const lastIdx = program.length -1;
    return (
      <>
        ({program.map((p, i) => {
          const key = parentKey ? `${parentKey}/${i}` : `${i}`;
          return (
            <React.Fragment key={key}>
              <ProgramExpression program={p} parentKey={key} />
              {i !== lastIdx ? <>&nbsp;</> : null}
            </React.Fragment>
          )
        })})
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
        <code><ProgramExpression program={response.program_nested_expression} /></code>
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
        </Tabs>
      </OutputField>
    </React.Fragment>
  );
}

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
