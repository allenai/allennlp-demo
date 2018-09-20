import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneLeft, PaneRight } from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'

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

const title = "Event2Mind";
const description = (
  <span>
    <span>
      The Event2Mind dataset proposes a commonsense inference task between events and mental states. In particular, it takes events as lightly preprocessed text and produces likely intents and reactions for individuals in the event.
      This page demonstrates a reimplementation of
    </span>
    <a href="https://www.semanticscholar.org/paper/b89f8a9b2192a8f2018eead6b135ed30a1f2144d" target="_blank" rel="noopener noreferrer">{' '} the original Event2Mind system (Rashkin et al, 2018)</a>
    <span>
      . An event with people entities should be typed as "PersonX" or "PersonY". Optionally, "___" can be used for uncommon objects.
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


/*******************************************************************************
  <Event2MindOutput /> Component
*******************************************************************************/

class Event2MindOutput extends React.Component {
  render() {
    const { responseData } = this.props;
    const target_types = {
      "Person X's Intent": "xintent_top_k_predicted_tokens",
      "Person X's Reaction": "xreact_top_k_predicted_tokens",
      "Other's Reaction": "oreact_top_k_predicted_tokens"
    }

    return (
      <div className="model__content model__content--event2Mind-output">
        <ul>
          {Object.keys(target_types).map((target_desc, i) => {
            return (
              <div key={i}>
                <p>{target_desc}</p>
                <li>
                  {responseData[target_types[target_desc]].map((target, j) => {
                      return (
                          <p key={j}><b>{j}:</b> {target.join(" ")}</p>
                      )
                  })}
                </li>
              </div>
            )
          })}
        </ul>
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
      visualizationType: VisualizationType.TEXT
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
      default:
        viz = <Event2MindOutput responseData={responseData} />;
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
          {/*
            // TODO(aarons): Temporarily hiding this navigation UI behind a comment
            // since we will need to add it back in the next iteration.

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
          */}
          {viz}
        </PaneRight>
      </div>
    );
  }
}

const Event2MindComponent = withRouter(_Event2MindComponent)

export default Event2MindComponent;
