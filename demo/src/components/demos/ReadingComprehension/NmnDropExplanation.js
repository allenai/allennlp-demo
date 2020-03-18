import React from 'react';
import { Tooltip, Collapse } from 'antd';
import styled from 'styled-components';
import OutputField from '../../OutputField'
import NestedHighlight, { withHighlightClickHandling, getHighlightColor } from '../../highlight/NestedHighlight';
import FormItem from 'antd/lib/form/FormItem';

const DEFAULT_FILTER_VALUE = 0.001

const setIsEqual = (a, b) => {
  return Array.from(a).every(value => b.has(value)) && Array.from(b).every(value => a.has(value))
}

const processHighlightData = (programExecution, dataType, filterValues, tokens, moduleNames) => {
  // Create an empty key for each module
  const internalKeyNames = {}
  const initialData = moduleNames.reduce((data, name) => {
    let key = name.replace(/_/g, '-');
    // Rename the cluster key if there are duplicate modules
    while (data[key]) {
      key = `${key}*`
    }
    data[key] = {
      displayName: name,
      values: [],
      highlightedIndicies: new Set(),
      clusters: [],
    }
    internalKeyNames[name] = false
    return data;
  }, {})

  // Ensure the program execution key names match our internal keys for uniqueness
  const executionWithInternalKeys = programExecution.map(execution => {
    Object.keys(execution).forEach(moduleName => {
      let name = moduleName
      while (internalKeyNames[name]) {
        name = `${name}*`
      }
      internalKeyNames[name] = true
      const temp = execution[moduleName]
      delete execution[moduleName]
      execution[name] = temp
    })
    return execution
  })

  // Fill out values and filtered highlighted indicies for all modules of this data type
  const outputData = executionWithInternalKeys.reduce((dataWithHighlights, execution) => {
    Object.keys(execution).forEach(moduleName => {
      if (execution[moduleName][dataType]) {
        dataWithHighlights[moduleName] = {
          displayName: moduleName,
          values: execution[moduleName][dataType],
          highlightedIndicies: new Set(execution[moduleName][dataType].map((value, i) => value > (filterValues[moduleName] || DEFAULT_FILTER_VALUE) ? i : undefined).filter(i => i)),
          clusters: [],
        }
      }
    })
    return dataWithHighlights;
  }, initialData);

  // Create clusters of highlights, ensuring no cluster overlaps another
  // cluster's boundary
  const moduleKeys = Object.keys(outputData)
  let prevModulesWithHighlight = new Set()
  for (let i = 0; i < tokens.length; i++) {
    const modulesWithHighlight = new Set()
    for (let n = 0; n < moduleKeys.length; n++) {
      if (outputData[moduleKeys[n]].highlightedIndicies.has(i)) {
        modulesWithHighlight.add(moduleKeys[n])
      }
    }

    if (setIsEqual(prevModulesWithHighlight, modulesWithHighlight)) {
      modulesWithHighlight.forEach(m => {
        outputData[m].clusters[outputData[m].clusters.length - 1][1] = i;
      })
    } else {
      modulesWithHighlight.forEach(m => {
        outputData[m].clusters.push([i, i])
      })
    }
    prevModulesWithHighlight = modulesWithHighlight;
  }
  return outputData;
}

const HighlightTooltipData = props => {
  const {
    data,
    index
  } = props;

  return (
    <div>
      {Object.keys(data)
        .filter(m => !!data[m].values[index])
        .map(m => (
          <div key={m}>{data[m].displayName}: {data[m].values[index]}</div>
        ))}
    </div>
  )
}

// TODO: THis is a hack, if this treatment lands it should be eliminated. The processHighlightData
// methods should likely be refactored to make all this bit fiddling unecessary.
function renderProgramWithHighlights(displayInfoByName, maybeModuleName, listeners, isLast = false, seenKeys = new Set()) {
  if (Array.isArray(maybeModuleName)) {
    const lastIdx = maybeModuleName.length - 1;
    return (
      <React.Fragment>
        ({ maybeModuleName.map((m, i) =>
            renderProgramWithHighlights(displayInfoByName, m, listeners, i === lastIdx, seenKeys)) }){!isLast ? ' ' : null}
      </React.Fragment>
    );
  } else {
    // TODO: This is a ridiculous hack. On line 19 you can see how, on the client, we ensure
    // names are unique by appending a trailing `*`. We use the same hack here to "resolve" a
    // key that should exist in the map that ultimately gives us the "highlight index" and
    // the display name of the module. The "highlight index" is a way to tell the highlighting
    // mechanism what to highlight when this module is hovered.
    let resolvedKey = maybeModuleName;
    while(seenKeys.has(resolvedKey)) {
      resolvedKey = `${resolvedKey}*`;
    }
    seenKeys.add(resolvedKey);

    // See if we have display info for the thing. It's possible we don't. Why, I'm not sure.
    // TODO: Figure out why not and either update the comment or fix this tom foolery.
    const { idx, displayName } = (
      resolvedKey in displayInfoByName
        ? displayInfoByName[resolvedKey]
        : { idx: -1, displayName: resolvedKey }
    );
    const { onMouseDown, onMouseOver, onMouseOut, onMouseUp } = listeners;
    return (
      <React.Fragment>
        <span
            key={maybeModuleName}
            className={idx !== -1 ? `highlight-text--${getHighlightColor(idx)}` : ''}
            onMouseDown={onMouseDown ? () => onMouseDown(resolvedKey, 0) : null}
            onMouseOver={onMouseOver ? () => onMouseOver(resolvedKey) : null}
            onMouseOut={onMouseOut ? () => onMouseOut(resolvedKey) : null}
            onMouseUp={onMouseUp ? () => onMouseUp(resolvedKey) : null}
        >
          {displayName}
        </span>{!isLast ? ' ' : null}
      </React.Fragment>
    );
  }
}

class NmnDrop extends React.Component {
  state = {
    questionData: {},
    passageData: {},
    filterValues: {},
  }

  componentDidMount() {
    this.updateData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.programExecution !== this.props.programExecution) {
      this.updateData();
    }
  }

  updateData = () => {
    const {
      programExecution,
      questionTokens,
      passageTokens,
      programNestedExpression,
    } = this.props;
    const {
      filterValues
    } = this.state;
    const moduleNames = programNestedExpression.flat(Infinity).reverse()
    const questionData = processHighlightData(programExecution, 'question', filterValues, questionTokens, moduleNames)
    const passageData = processHighlightData(programExecution, 'passage', filterValues, passageTokens, moduleNames)
    this.setState({ questionData, passageData });
  }

  handleUpdateFilterValue = (name) => (e) => {
    const filterValue = e.target.value;
    const filterValues = {
      ...this.state.filterValues,
      [name]: filterValue
    }
    this.setState({ filterValues }, this.updateData)
  }

  render () {
    const {
      activeIds,
      activeDepths,
      isClicking,
      selectedId,
      onMouseDown,
      onMouseOut,
      onMouseOver,
      onMouseUp,
      questionTokens,
      passageTokens,
      answer,
      question,
      programNestedExpression
    } = this.props
    const {
      questionData,
      passageData,
    } = this.state;
    const questionClusters = Object.keys(questionData).reduce((data, d) => {
      data[d] = questionData[d].clusters;
      return data;
    }, {})
    const passageClusters = Object.keys(passageData).reduce((data, d) => {
      data[d] = passageData[d].clusters;
      return data;
    }, {})
    const moduleDisplayInfoByName = Object.keys(questionData).reduce((byName, key, idx) => {
      if (byName[key]) {
        throw Error(`Duplicate key: ${key}`);
      }
      byName[key] = {
        displayName: questionData[key].displayName,
        idx
      };
      return byName;
    }, {});
    return (
      <section>
        <OutputField label="Answer">
          {answer}
        </OutputField>
        <OutputField label="Explanation">
          <QuestionStep>
            {question}
          </QuestionStep>
          <QuestionStep>
            ↓
          </QuestionStep>
          <QuestionStep>
            Question Parser
          </QuestionStep>
          <QuestionStep>
            ↓
          </QuestionStep>
          <QuestionStep>
            ↓
          </QuestionStep>
          <CodeQuestionStep>
            {renderProgramWithHighlights(
                moduleDisplayInfoByName,
                programNestedExpression,
                { onMouseDown, onMouseOut, onMouseOver, onMouseUp },
                false
            )}
          </CodeQuestionStep>
          <QuestionStep>
            ↓
          </QuestionStep>
          <QuestionStep>
            {answer}
          </QuestionStep>
        </OutputField>
        <OutputField label="Question">
          <NestedHighlight
              activeDepths={activeDepths}
              activeIds={activeIds}
              clusters={questionClusters}
              isClickable
              isClicking={isClicking}
              labelPosition="bottom"
              onMouseDown={onMouseDown}
              onMouseOut={onMouseOut}
              onMouseOver={onMouseOver}
              onMouseUp={onMouseUp}
              selectedId={selectedId}
              tokens={questionTokens.map((t, i) => <Tooltip title={<HighlightTooltipData index={i} data={questionData} />}>{t}</Tooltip>)}
            />
        </OutputField>
        <OutputField label="Passage">
          <NestedHighlight
              activeDepths={activeDepths}
              activeIds={activeIds}
              clusters={passageClusters}
              isClickable
              isClicking={isClicking}
              labelPosition="bottom"
              onMouseDown={onMouseDown}
              onMouseOut={onMouseOut}
              onMouseOver={onMouseOver}
              onMouseUp={onMouseUp}
              selectedId={selectedId}
              tokens={passageTokens.map((t, i) => <Tooltip title={<HighlightTooltipData index={i} data={passageData} />}>{t}</Tooltip>)}
            />
        </OutputField>
        <OutputField label="For Model Developers">
          <Collapse>
            <Collapse.Panel header="Highlight Sensitivity" key="1">
              {Object.keys(questionData).map(d => (
                  <FormItem key={d}>
                    <label htmlFor="highlight-sensitivity">Adjust Highlight Sensitivity for {d}</label>
                    <input
                      id="highlight-sensitivity"
                      type="range"
                      min="0.00001"
                      max="0.01"
                      step="0.00001"
                      className="slider"
                      value={this.state.filterValues[d] || DEFAULT_FILTER_VALUE}
                      onChange={this.handleUpdateFilterValue(d)}
                    />
                  </FormItem>
              ))}
            </Collapse.Panel>
          </Collapse>
        </OutputField>
      </section>
    );
  }
}

const Predicate = styled.div`
  &&& {
    display: unset;
    text-align: center;
    width: ${props => props.width};
  }
`;

const PredicateWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const QuestionStep = styled.div`
  text-align: center;
`;

const CodeQuestionStep = styled(QuestionStep)`
  font-family: monospace;
  font-weight: 900;
  font-size: 1.25em;
`;

const NmnDropExplanation = withHighlightClickHandling(NmnDrop);


export default NmnDropExplanation;
