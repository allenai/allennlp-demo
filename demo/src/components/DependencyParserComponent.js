import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneTop, PaneBottom } from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'
import { Tree } from 'hierplane';

/*******************************************************************************
  <DependencyParserInput /> Component
*******************************************************************************/

const dependencyParserSentences = [
  "James ate some cheese whilst thinking about the play.",
  "She decided not to take the house she'd viewed yesterday.",
  "The proportion of PepsiCo’s revenue coming from healthier food and beverages has risen from 38% in 2006 to 50%.",
  "CRISPR-Cas9 is a versatile genome editing technology for studying the functions of genetic elements."
];

const title = "Dependency Parsing";
const description = (
  <span>
    <span>
    A dependency parser analyzes the grammatical structure of a sentence, establishing relationships between "head" words and words which modify those heads.
    This demo is an implementation of a neural model for dependency parsing using biaffine classifiers on top of a bidirectional LSTM based on
    </span>
    <a href="https://arxiv.org/abs/1611.01734" target="_blank" rel="noopener noreferrer">{' '} Deep Biaffine Attention for Neural Dependency Parsing (Dozat, 2017).</a>
  </span>
);

class DependencyParserInput extends React.Component {
  constructor(props) {
    super(props);

    // If we're showing a permalinked result, we'll get passed in a sentence.
    const { sentence } = props;

    this.state = {
      sentenceValue: sentence || "",
    };
    this.handleListChange = this.handleListChange.bind(this);
    this.handleSentenceChange = this.handleSentenceChange.bind(this);
  }

  handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
        dependencyParserSentenceValue: dependencyParserSentences[e.target.value],
      });
    }
  }

  handleSentenceChange(e) {
    this.setState({
      dependencyParserSentenceValue: e.target.value,
    });
  }

  render() {
    const { dependencyParserSentenceValue } = this.state;
    const { outputState, runDependencyParserModel } = this.props;

    const dependencyParserInputs = {
      "sentenceValue": dependencyParserSentenceValue,
    };

    return (
      <div className="model__content">
        <ModelIntro title={title} description={description} />
        <div className="form__instructions"><span>Enter text or</span>
          <select disabled={outputState === "working"} onChange={this.handleListChange}>
            <option>Choose an example...</option>
            {dependencyParserSentences.map((sentence, index) => {
              return (
                <option value={index} key={index}>{sentence}</option>
              );
            })}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="#input--parser-sentence">Sentence</label>
          <input onChange={this.handleSentenceChange} value={dependencyParserSentenceValue} id="input--parser-sentence" ref="dependencyParserSentence" type="text" required="true" autoFocus="true" placeholder="E.g. &quot;John likes and Bill hates ice cream.&quot;" />
        </div>
        <div className="form__field form__field--btn">
          <Button enabled={outputState !== "working"} outputState={outputState} runModel={runDependencyParserModel} inputs={dependencyParserInputs} />
        </div>
      </div>
    );
  }
}

class HierplaneVisualization extends React.Component {
  render() {
    if (this.props.tree) {
      return (
        <div className="hierplane__visualization">
          <Tree tree={this.props.tree} theme="light" />
        </div>
      )
    } else {
      return null;
    }
  }
}

/*******************************************************************************
  <dependencyParserComponent /> Component
*******************************************************************************/


class _DependencyParserComponent extends React.Component {
  constructor(props) {
    super(props);

    const { requestData, responseData } = props;

    this.state = {
      requestData: requestData,
      responseData: responseData,
      // valid values: "working", "empty", "received", "error",
      outputState: responseData ? "received" : "empty",
    };
    this.runDependencyParserModel = this.runDependencyParserModel.bind(this);
  }

  runDependencyParserModel(event, inputs) {
    this.setState({outputState: "working"});

    var payload = {sentence: inputs.sentenceValue};

    fetch(`${API_ROOT}/predict/dependency-parsing`, {
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
      const newPath = slug ? '/dependency-parsing/' + slug : '/dependency-parsing';

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
    const sentence = requestData && requestData.sentence;

    return (
      <div className="pane__horizontal model">
        <PaneTop>
          <DependencyParserInput runDependencyParserModel={this.runDependencyParserModel}
            outputState={this.state.outputState}
            sentence={sentence} />
        </PaneTop>
        <PaneBottom outputState={this.state.outputState}>
          <HierplaneVisualization tree={responseData ? responseData.hierplane_tree : null} />
        </PaneBottom>
      </div>
    );
  }
}

const DependencyParserComponent = withRouter(_DependencyParserComponent)

export default DependencyParserComponent;
