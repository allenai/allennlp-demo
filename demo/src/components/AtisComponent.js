import React from 'react';
import HeatMap from './heatmap/HeatMap'
import Collapsible from 'react-collapsible'
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import {PaneLeft, PaneRight} from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'

/*******************************************************************************
  <McInput /> Component
*******************************************************************************/

const parserExamples = [
    {
      question: "show me the flights from detroit to westchester county",
    },
    {
      question: "all northwest and united airlines flights with stopovers in denver",
    },
];

const title = "Atis Semantic Parsing";
const description = (
  <span>
    <span>
    This is a demo for natural language to SQL with the ATIS dataset.
    </span>
  </span>
);


class AtisInput extends React.Component {
constructor(props) {
    super(props);

    // If we're showing a permalinked result,
    // we'll get passed in a table and question.
    const { question } = props;

    this.state = {
      questionValue: question || ""
    };
    this.handleListChange = this.handleListChange.bind(this);
    this.handleQuestionChange = this.handleQuestionChange.bind(this);
}

handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
          questionValue: parserExamples[e.target.value].question,
      });
    }
}


handleQuestionChange(e) {
    this.setState({
    questionValue: e.target.value,
    });
}

render() {

    const { questionValue } = this.state;
    const { outputState, runParser } = this.props;

    const parserInputs = {
    "questionValue": questionValue
    };

    return (
        <div className="model__content">
        <ModelIntro title={title} description={description} />
            <div className="form__instructions"><span>Enter text or</span>
            <select disabled={outputState === "working"} onChange={this.handleListChange}>
                <option value="">Choose an example...</option>
                {parserExamples.map((example, index) => {
                  return (
                      <option value={index} key={index}>{example.question.substring(0,60) + "..."}</option>
                  );
                })}
            </select>
            </div>
            <div className="form__field">
            <label htmlFor="#input--mc-question">Utterance</label>
            <input onChange={this.handleQuestionChange} id="input--mc-question" type="text" required="true" value={questionValue} placeholder="show me the flights from detroit to westchester county" disabled={outputState === "working"} />
            </div>
            <div className="form__field form__field--btn">
            <Button enabled={outputState !== "working"} runModel={runParser} inputs={parserInputs} />
            </div>
        </div>
        );
    }
}


/*******************************************************************************
  <AtisOutput /> Component
*******************************************************************************/

class AtisOutput extends React.Component {
    render() {
      const { actions, answer, entities, feature_scores, linking_scores, logical_form, question_tokens, similarity_scores } = this.props;

      return (
        <div className="model__content">

          <div className="form__field">
            <label>logical_form</label>
            <div className="model__content__summary">{ logical_form}</div>
          </div>
          
          { <div className="form__field">
            <Collapsible trigger="Model internals (beta)">
              <Collapsible trigger="Predicted actions">
                {actions.map((action, action_index) => (
                  <Collapsible key={"action_" + action_index} trigger={action['predicted_action']}>
                    <ActionInfo action={action} question_tokens={question_tokens}/>
                  </Collapsible>
                ))}
              </Collapsible>

              {/*
              <Collapsible trigger="Entity linking scores">
                  <HeatMap xLabels={question_tokens} yLabels={entities} data={linking_scores} xLabelWidth={250} />
              </Collapsible>
              {feature_scores &&
                <Collapsible trigger="Entity linking scores (features only)">
                    <HeatMap xLabels={question_tokens} yLabels={entities} data={feature_scores} xLabelWidth={250} />
                </Collapsible>
              }*/}
              </Collapsible>
          </div>}
          
        </div>
      );
    }
  }


class ActionInfo extends React.Component {
  render() {
    const { action, question_tokens } = this.props;
    const utterance_attention = action['utterance_attention'].map(x => [x]);
    const considered_actions = action['considered_actions'];
    const action_probs = action['action_probabilities'].map(x => [x]);

    const probability_heatmap = (
      <div className="heatmap">
         <HeatMap xLabels={['Prob']} yLabels={considered_actions} data={action_probs} xLabelWidth={250} /> 
      </div>
    );
    
    const utterance_attention_heatmap = utterance_attention.length > 0 ? (
      <div className="heatmap">
         <HeatMap xLabels={['Prob']} yLabels={question_tokens} data={utterance_attention} xLabelWidth={70} />
      </div>
    ) : (
      ""
    )


    return (
      <div>
        {probability_heatmap}
        {utterance_attention_heatmap}
      </div>
    )
  }
}


/*******************************************************************************
  <McComponent /> Component
*******************************************************************************/

class _AtisComponent extends React.Component {
     constructor(props) {
      super(props);

      const { requestData, responseData } = props;

      this.state = {
        outputState: responseData ? "received" : "empty", // valid values: "working", "empty", "received", "error"
        requestData: requestData,
        responseData: responseData
      };

      this.runParser = this.runParser.bind(this);
    }

    runParser(event, inputs) {
      this.setState({outputState: "working"});
      var payload = {
        utterance: inputs.questionValue,
      };
      fetch(`${API_ROOT}/predict/atis-parser`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }).then((response) => {
        return response.json();
      }).then((json) => {
        // If the response contains a `slug` for a permalink, we want to redirect
        // to the corresponding path using `history.push`.
        const { slug } = json;
        const newPath = slug ? '/atis-parser/' + slug : '/atis-parser';

        // We'll pass the request and response data along as part of the location object
        // so that the `Demo` component can use them to re-render.
        const location = {
          pathname: newPath,
          state: { requestData: payload, responseData: json }
        }
        this.props.history.push(location);
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }

    render() {
      const { requestData, responseData } = this.props;

      console.log("responseData")
      console.log(responseData)

      const table = requestData && requestData.table;
      const question = requestData && requestData.question;
      const answer = responseData && responseData.answer;
      const logical_form = responseData && responseData.logical_form;
      const actions = responseData && responseData.predicted_actions;
      const linking_scores = responseData && responseData.linking_scores;
      const feature_scores = responseData && responseData.feature_scores;
      const similarity_scores = responseData && responseData.similarity_scores;
      const entities = responseData && responseData.entities;
      const question_tokens = responseData && responseData.tokenized_utterance;


      return (
        <div className="pane model">
          <PaneLeft>
            <AtisInput runParser={this.runParser}
                             outputState={this.state.outputState}
                             question={question}/>
          </PaneLeft>
          <PaneRight outputState={this.state.outputState}>
            <AtisOutput answer={answer}
                        logical_form={logical_form}
                        actions={actions}
                        linking_scores={linking_scores}
                        feature_scores={feature_scores}
                        similarity_scores={similarity_scores}
                        entities={entities}
                        question_tokens={question_tokens}
            />
          </PaneRight>
        </div>
      );

    }
}

const AtisComponent = withRouter(_AtisComponent);

export default AtisComponent;
