import React from 'react';
import styled from 'styled-components';
import OutputField from '../../OutputField';
import { Tooltip, Row, Col, Tabs, Slider } from 'antd';
import { FormField, FormLabel } from '../../Form';

const punc = new Set("!?,;.-'");
function isPunctuation(char, debug = false) {
  if (debug) {
    console.log(char, punc.has(char));
  }
  return punc.has(char);
}

function shouldHaveLeadingSpace(curToken, prevToken) {
  if (!prevToken) {
    return false;
  }
  return (
    prevToken !== '' &&
    !isPunctuation(curToken[0]) &&
    !prevToken.endsWith('-')
  );
}

// TODO: Use styled component
function stylesForSpan(active, alpha) {
  return Object.assign({ padding: '1px' }, active ? {
    background: `rgba(252, 255, 0, ${alpha})`,
    fontWeight: 'bold',
    borderBottom: `2px solid rgba(252, 255, 0, 1)`
  } : {});
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

const Text = ({ tokens, output, activeThreshold }) => {
  const fragments = [];
  let prevToken = null;
  for(const [ idx, token ] of Object.entries(tokens)) {
    const prob = output[idx] || 0;
    const active = prob >= activeThreshold;
    const nf = Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
    const alpha = prob / 1;
    fragments.push((
      <React.Fragment key={`${idx}/${token}`}>
        {shouldHaveLeadingSpace(token, prevToken) ? ' ' : ''}
        {active ? (
          <Tooltip title={nf.format(prob)}>
            <span style={stylesForSpan(active, alpha)}>
              {token}
            </span>
          </Tooltip>
        ) : (
          <span style={stylesForSpan(active, alpha)}>
            {token}
          </span>
        )}
      </React.Fragment>
    ));
    prevToken = token;
  }
  return fragments;
}

class ModuleDescription {
  constructor(name, signature, description) {
    this.name = name;
    this.signature = signature;
    this.description = description;
  }
}

const ModuleDefinition = styled.div`
  ${({ theme }) => `
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.palette.border.info};
    border-radius: 4px;
    background: ${theme.palette.background.info};
    color: ${theme.palette.text.info};
    margin: 0 0 ${theme.spacing.md};
  `}
`;

const moduleDescriptions = [
  new ModuleDescription(
    'find',
    'find(Q) → P ',
    'For question spans in the input, find similar spans in the passage'
  ),
  new ModuleDescription(
    'filter',
    'filter(Q, P) → P ',
    'Based on the question, select a subset of spans from the input'
  ),
  new ModuleDescription(
    'relocate',
    'relocate(Q, P) → P',
    'Find the argument asked for in the question for input paragraph spans'
  ),
  new ModuleDescription(
    'find-num',
    'find-num(P) → N',
    'Find the number(s) associated to the input paragraph spans'
  ),
  new ModuleDescription(
    'find-date',
    'find-date(P) → D',
    'Find the date(s) associated to the input paragraph spans'
  ),
  new ModuleDescription(
    'count',
    'count(P) → C ',
    'Count the number of input passage spans'
  ),
  new ModuleDescription(
    'compare-num-lt',
    'compare-num-lt(P1, P2) → P ',
    'Output the span associated with the smaller number'
  ),
  new ModuleDescription(
    'time-diff',
    'time-diff(P1, P2) → TD ',
    'Difference between the dates associated with the paragraph spans'
  ),
  new ModuleDescription(
    'find-max-num',
    'find-max-num(P) → P',
    'Select the span that is associated with the largest number'
  ),
  new ModuleDescription(
    'span',
    'span(P) → S ',
    'Identify a contiguous span from the attended tokens'
  )
]

class LogScale {
  constructor(min, max, values) {
    this.range = [ min, max ];
    this.values = values.map(v => Math.log(v));
    this.factor = (this.values[1] - this.values[0]) / (this.range[1] - this.range[0]);
  }
  scale(value) {
    return this.range[0] + (Math.log(value) - this.values[0]) / this.factor;
  }
  value(pos) {
    return Math.exp((pos - this.range[0]) * this.factor + this.values[0]);
  }
}

const ImportantInputText = ({ response, output }) => {
  const probs =
    (output.question || []).concat(output.passage || [])
                           .slice()
                           .sort((a, b) => a - b);

  const log = new LogScale(0, 1, [ probs[0], Math.max(probs[probs.length - 1], 1) ]);
  const mid = log.value(0.5);
  const [ minProb, setMinProb ] = React.useState(mid);
  return (
    <React.Fragment>
        <FormField>
          <FormLabel>Minimum Probability:</FormLabel>
          <Row>
            <Col span={12}>
              <Slider
                  min={log.range[0]}
                  max={log.range[1]}
                  step={(log.range[1] - log.range[0]) / 100}
                  tipFormatter={p => log.value(p)}
                  onChange={p => setMinProb(log.value(p))}
                  value={log.scale(minProb)} />
            </Col>
            <Col span={8}>
              {minProb}
            </Col>
          </Row>
        </FormField>
        <OutputField label="Question">
          <Text
              tokens={response.question_tokens}
              output={output.question || []}
              activeThreshold={minProb} />
        </OutputField>
        <OutputField label="Passage">
          <Text
              tokens={response.passage_tokens || []}
              output={output.passage}
              activeThreshold={minProb} />
        </OutputField>
    </React.Fragment>
  )
}

const NMNOutputExplanation = ({ response }) => {
  return (
    <React.Fragment>
      <OutputField label="Answer">{response.answer}</OutputField>
      <OutputField label="Program">
        <code>{response.program_lisp}</code>
      </OutputField>
      <OutputField label="Execution Steps">
        <Tabs animated={false}>
          {response.program_execution.map((outputByName, idx) => (
            Object.getOwnPropertyNames(outputByName).map(moduleName => {
              const key = `${idx}/${moduleName}`;
              const output = outputByName[moduleName];
              const tab = (
                <React.Fragment>
                  {idx + 1}. <code>{moduleName}</code>
                </React.Fragment>
              );
              // TODO: Comment this
              const normalizedModuleName = moduleName.replace(/\*+$/, '');
              const desc =
                moduleDescriptions.find(desc => desc.name == normalizedModuleName);
              const description = desc ? (
                <ModuleDefinition>
                  <strong>{desc.signature}</strong> {desc.description}
                </ModuleDefinition>
              ) : null;
              switch (normalizedModuleName) {
                case 'find':
                // TODO: find-max-num will have a new, intermediate representation
                case 'find-max-num':
                case 'find-date':
                case 'filter':
                case 'relocate': {
                  return (
                    <Tabs.TabPane tab={tab} key={key}>
                      {description}
                      <ImportantInputText response={response} output={output} />
                    </Tabs.TabPane>
                  );
                }
                default: {
                  return (
                    <Tabs.TabPane tab={tab} key={key}>
                      {description}
                      <RawResponse>
                        <pre>{JSON.stringify(output, null, 2)}</pre>
                      </RawResponse>
                    </Tabs.TabPane>
                  )
                }
              }
            })
          ))}
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

export default NMNOutputExplanation;
