import React from 'react';
import styled from 'styled-components';
import OutputField from '../../OutputField';
import { Row, Col, Tabs, Slider } from 'antd';
import { FormField, FormLabel } from '../../Form';
import { Highlight } from '../../highlight/Highlight';
import HighlightContainer from '../../highlight/HighlightContainer';
import { getHighlightColor } from '../../highlight/NestedHighlight';

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

const Text = ({ tokens, output, activeThreshold, moduleName, highlightColor }) => {
  const fragments = [];
  for(const [ idx, token ] of Object.entries(tokens)) {
    const prob = output[idx] || 0;
    const active = prob >= activeThreshold;
    const nf = Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
    fragments.push((
      <React.Fragment key={`${idx}/${token}`}>
        {active ? (
          <Highlight tooltip={nf.format(prob)} label={moduleName} color={highlightColor}>
            <span>{token} </span>
          </Highlight>
        ) : (
          <span>{token} </span>
        )}
      </React.Fragment>
    ));
  }
  return <HighlightContainer>{fragments}</HighlightContainer>;
}

class ModuleDescription {
  constructor(name, signature, description, color) {
    this.name = name;
    this.signature = signature;
    this.description = description;
    this.color = color;
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
    'find(Q) → P',
    'For text spans in the question, find similar text spans in the passage.',
    getHighlightColor(0)
  ),
  new ModuleDescription(
    'filter',
    'filter(Q, P) → P',
    'Based on the question, select a subset of spans from the input.',
    getHighlightColor(1)
  ),
  new ModuleDescription(
    'relocate',
    'relocate(Q, P) → P',
    'Find spans in the passage related to an argument in the question.',
    getHighlightColor(2)
  ),
  new ModuleDescription(
    'find-num',
    'find-num(P) → N',
    'Find the number(s) associated to the input paragraph spans.',
    getHighlightColor(3)
  ),
  new ModuleDescription(
    'find-date',
    'find-date(P) → D',
    'Find the date(s) associated to the input paragraph spans.',
    getHighlightColor(4)
  ),
  new ModuleDescription(
    'count',
    'count(P) → C',
    'Count the number of input passage spans.',
    getHighlightColor(5)
  ),
  new ModuleDescription(
    'compare-num-lt',
    'compare-num-lt(P1, P2) → P ',
    'Output the span associated with the smaller number.',
    getHighlightColor(6)
  ),
  new ModuleDescription(
    'time-diff',
    'time-diff(P1, P2) → TD',
    'Difference between the dates associated with the paragraph spans.',
    getHighlightColor(7)
  ),
  new ModuleDescription(
    'find-max-num',
    'find-max-num(P) → P',
    'Select the text span in the passage with the largest number.',
    getHighlightColor(8)
  ),
  new ModuleDescription(
    'find-min-num',
    'find-min-num(P) → P',
    'SElect the text span in the passage with the smallest number.',
    getHighlightColor(9)
  ),
  new ModuleDescription(
    'span',
    'span(P) → S',
    'Identify a contiguous span from the attended tokens.',
    getHighlightColor(10)
  )
];

class LogScale {
  // We shift the provided values by 1, as to handle the fact that our value
  // range is from 0 to 1, inclusive. This is to avoid the fact that log(0) is
  // -Infinity.
  static SHIFT = 1;
  constructor(min, max, values) {
    this.range = [ min, max ];
    this.values = values.map(v => Math.log(v + LogScale.SHIFT));
    this.factor = (this.values[1] - this.values[0]) / (this.range[1] - this.range[0]);
  }
  scale(value) {
    return this.range[0] + (Math.log(value + LogScale.SHIFT) - this.values[0]) / this.factor;
  }
  value(pos) {
    return Math.exp((pos - this.range[0]) * this.factor + this.values[0]) - LogScale.SHIFT;
  }
}

// The slider's slider gets cut off on the left w/o this.
const ColWithLeftPadding = styled(Col)`
  ${({ theme }) => `
    padding-left: ${theme.spacing.xs};
  `}
`

const ImportantInputText = ({ response, output, moduleName, highlightColor }) => {
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
            <ColWithLeftPadding span={12}>
              <Slider
                  min={log.range[0]}
                  max={log.range[1]}
                  step={(log.range[1] - log.range[0]) / 100}
                  tipFormatter={p => log.value(p)}
                  onChange={p => setMinProb(log.value(p))}
                  value={log.scale(minProb)} />
            </ColWithLeftPadding>
            <Col span={8}>
              {minProb}
            </Col>
          </Row>
        </FormField>
        <OutputField label="Question">
          <Text
              tokens={response.question_tokens}
              output={output.question || []}
              moduleName={moduleName}
              activeThreshold={minProb}
              highlightColor={highlightColor} />
        </OutputField>
        <OutputField label="Passage">
          <Text
              tokens={response.passage_tokens || []}
              output={output.passage}
              moduleName={moduleName}
              activeThreshold={minProb}
              highlightColor={highlightColor} />
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
              // When there's multiple instances of the same module in a single
              // program, the module name is de-anonymized by prefixing it with
              // as many `*`s is necessary. We strip them here so we can look
              // up the module's description by it's canonical name.
              const canonicalModuleName = moduleName.replace(/\*+$/, '');
              const desc =
                moduleDescriptions.find(desc => desc.name === canonicalModuleName);
              const description = desc ? (
                <ModuleDefinition>
                  <strong>{desc.signature}</strong> {desc.description}
                </ModuleDefinition>
              ) : null;
              switch (canonicalModuleName) {
                case 'find':
                // TODO: find-max-num will have a new, intermediate representation
                case 'find-max-num':
                case 'find-min-num':
                case 'find-date':
                case 'filter':
                case 'relocate': {
                  return (
                    <Tabs.TabPane tab={tab} key={key}>
                      {description}
                      <ImportantInputText
                          response={response}
                          output={output}
                          moduleName={moduleName}
                          highlightColor={desc.color || 'blue'} />
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
