import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneLeft, PaneRight } from './Pane';
import Button from './Button';
import HighlightArrow from './highlight/HighlightArrow';
import HighlightContainer from './highlight/HighlightContainer';
import { Highlight } from './highlight/Highlight';
import ModelIntro from './ModelIntro';
import '../css/Event2MindDiagram.css';

/*******************************************************************************
  <Event2MindInput /> Component
*******************************************************************************/

const event2MindSentences = [
  "PersonX starts to yell at PersonY",
  "PersonX drops a hint",
  "PersonX reports ___ to the police",
  "PersonX drinks a cup of coffee",
  "PersonX carries out PersonX's threat",
  "It starts snowing",
];

const supportedTargetTypes = [
  {
    responseDataKey: "xintent_top_k_predicted_tokens",
    prettyLabel: "Person X's Intent",
    color: "blue",
    noneDescription: "no intent"
  },
  {
    responseDataKey: "xreact_top_k_predicted_tokens",
    prettyLabel: "Person X's Reaction",
    color: "orange",
    noneDescription: "no reaction"
  },
  {
    responseDataKey: "oreact_top_k_predicted_tokens",
    prettyLabel: "Other's Reaction",
    color: "orange",
    noneDescription: "no others involved"
  }
];

const title = "Event2Mind";
const description = (
  <span>
    <span>
      The Event2Mind dataset proposes a commonsense inference task between events and mental states. In particular, it takes events as lightly preprocessed text and produces likely intents and reactions for participants of the event.
      This page demonstrates a reimplementation of
    </span>
    <a href="https://www.semanticscholar.org/paper/b89f8a9b2192a8f2018eead6b135ed30a1f2144d" target="_blank" rel="noopener noreferrer">{' '} the original Event2Mind system (Rashkin et al, 2018)</a>
    <span>
      . An event with people entities should be typed as "PersonX" or "PersonY". Optionally, "___" can be used as a placeholder for objects or phrases.
    </span>
  </span>
);

class Event2MindInput extends React.Component {
  constructor(props) {
    super(props);

    // If we're showing a permalinked result, we'll get passed in a sentence.
    const { sentence } = props;

    this.state = {
      event2MindSentenceValue: sentence || "",
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleSentenceChange = this.handleSentenceChange.bind(this);
  }

  handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
        event2MindSentenceValue: event2MindSentences[e.target.value],
      });
    }
  }

  handleSentenceChange(e) {
    this.setState({
      event2MindSentenceValue: e.target.value,
    });
  }

  handleKeyDown(e, inputs) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.props.runEvent2MindModel(e, inputs);
    }
  }

  render() {
    const { event2MindSentenceValue } = this.state;
    const { outputState, runEvent2MindModel } = this.props;

    const event2MindInputs = {
      "sentenceValue": event2MindSentenceValue,
    };

    const callHandleKeyDown = (e) => { this.handleKeyDown(e, event2MindInputs)};

    return (
      <div className="model__content">
        <ModelIntro title={title} description={description} />
        <div className="form__instructions"><span>Enter text or</span>
          <select disabled={outputState === "working"} onChange={this.handleListChange} onKeyDown={callHandleKeyDown}>
            <option>Choose an example...</option>
            {event2MindSentences.map((sentence, index) => {
              return (
                <option value={index} key={index}>{sentence}</option>
              );
            })}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="#input--event2Mind-sentence">Event</label>
          <input onChange={this.handleSentenceChange} onKeyDown={callHandleKeyDown} value={event2MindSentenceValue} id="input--event2Mind-sentence" ref="event2MindSentence" type="text" required="true" autoFocus="true" placeholder="E.g. &quot;PersonX eats ice cream.&quot;" />
        </div>
        <div className="form__field form__field--btn">
          <Button enabled={outputState !== "working"} outputState={outputState} runModel={runEvent2MindModel} inputs={event2MindInputs} />
        </div>
      </div>
    );
  }
}

// Remove the special "@@UNKNOWN@@" token from model output, replace "none", join tokens.
function processTokens(tokens, noneReplacement) {
  return tokens.filter(target => {
    return target.length !== 1 || target[0] !== "@@UNKNOWN@@";
  }).map(target => {
    if (target.length === 1 && target[0] === "none") {
      return <em> {noneReplacement} </em>;
    } else {
      return target.join(" ");
    }
  })
}

/*******************************************************************************
  <Event2MindDiagramOutput /> Component
*******************************************************************************/

class Event2MindDiagramOutput extends React.Component {
  render() {
    const { responseData, sentence } = this.props;

    return (
      <div className="model__content">
        <HighlightContainer layout="diagram">
          <div className="e2m-event-container">
            <Highlight label="Event" color="gray" labelPosition="top">{sentence}</Highlight>
          </div>

          <div className="e2m-mind-container">
            {supportedTargetTypes.map((targetType, i) => {
              const tokens = processTokens(
                  responseData[targetType.responseDataKey], targetType.noneDescription
              )
              return (
                <div className="e2m-mind-container__target-type" key={i}>
                  <HighlightArrow color={targetType.color} direction="right" />
                  <Highlight label={targetType.prettyLabel} color={targetType.color} labelPosition="top">
                    <span>
                      {tokens.map((target, j) => {
                        return (
                          <span key={j}>{target}{j !== tokens.length - 1 ? ", " : ""}</span>
                        )
                      })}
                    </span>
                  </Highlight>
                </div>
              )
            })}
          </div>
        </HighlightContainer>
      </div>
    );
  }
}

/*******************************************************************************
  <Event2MindTextOutput /> Component
*******************************************************************************/

class Event2MindTextOutput extends React.Component {
  render() {
    const { responseData } = this.props;
    return (
      <div className="model__content model__content--event2Mind-output">
        {supportedTargetTypes.map((targetType, i) => {
          const tokens = processTokens(
              responseData[targetType.responseDataKey], targetType.noneDescription
          )
          return (
            <div key={i}>
              {i !== 0 ? (
                <div>
                  <hr />
                  <h3>{targetType.prettyLabel}</h3>
                </div>
              ) : (
                <h3 className="no-top-margin">{targetType.prettyLabel}</h3>
              )}
              {tokens.map((target, j) => {
                return (
                  <p key={j}>&nbsp;<strong>{j}:</strong> {target}</p>
                )
              })}
            </div>
          )
        })}
      </div>
    );
  }
}

/*******************************************************************************
  <Event2MindComponent /> Component
*******************************************************************************/

const VisualizationType = {
  DIAGRAM: 'Diagram',
  TEXT: 'Text'
};
Object.freeze(VisualizationType);

class _Event2MindComponent extends React.Component {
  constructor(props) {
    super(props);

    const { requestData, responseData } = props;

    this.state = {
      requestData: requestData,
      responseData: responseData,
      // valid values: "working", "empty", "received", "error",
      outputState: responseData ? "received" : "empty",
      visualizationType: VisualizationType.DIAGRAM
    };

    this.runEvent2MindModel = this.runEvent2MindModel.bind(this);
  }

  runEvent2MindModel(event, inputs) {
    this.setState({outputState: "working"});

    var payload = {source: inputs.sentenceValue};

    fetch(`${API_ROOT}/predict/event2mind`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json();
    }).then((json) => {
      // If the response contains a `slug` for a permalink, we want to redirect
      // to the corresponding path using `history.push`.
      const { slug } = json;
      const newPath = slug ? '/event2mind/' + slug : '/event2mind';

      // We'll pass the request and response data along as part of the location object
      // so that the `Demo` component can use them to re-render.
      const location = {
        pathname: newPath,
        state: { requestData: payload, responseData: json }
      }
      this.props.history.push(location);
    }).catch((error) => {
      this.setState({ outputState: "error" });
      console.error(error);
    });
  }

  render() {
    const { requestData, responseData } = this.props;
    const { visualizationType } = this.state;

    const sentence = requestData && requestData.source;

    let viz = null;
    switch(visualizationType) {
      case VisualizationType.TEXT:
        viz = <Event2MindTextOutput responseData={responseData} />;
        break;
      default: // VisualizationType.DIAGRAM
        viz = <Event2MindDiagramOutput responseData={responseData} sentence={sentence} />;
        break;
    }

    return (
      <div className="pane model">
        <PaneLeft>
          <Event2MindInput runEvent2MindModel={this.runEvent2MindModel}
            outputState={this.state.outputState}
            sentence={sentence} />
        </PaneLeft>
        <PaneRight outputState={this.state.outputState}>
          <ul className="visualization-types">
            {Object.keys(VisualizationType).map(tpe => {
              const vizType = VisualizationType[tpe];
              const className = (
                visualizationType === vizType
                  ? 'visualization-types__active-type'
                  : null
              );
              return (
                <li key={vizType} className={className}>
                  <a onClick={() => this.setState({ visualizationType: vizType })}>
                    {vizType}
                  </a>
                </li>
              );
            })}
          </ul>
          {viz}
        </PaneRight>
      </div>
    );
  }
}

const Event2MindComponent = withRouter(_Event2MindComponent)

export default Event2MindComponent;
