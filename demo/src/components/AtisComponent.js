import React from 'react';
import HeatMap from './heatmap/HeatMap'
import Collapsible from 'react-collapsible'
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import {PaneLeft, PaneRight} from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'
import SyntaxHighlight from './highlight/SyntaxHighlight.js';

/*******************************************************************************
  <AtisInput /> Component
*******************************************************************************/

const parserExamples = [
    {
      utterance: "show me the flights from detroit to westchester county",
    },
    {
      utterance: "show me flights from los angeles to pittsburgh on evening 1993 march first",
    },
    {
      utterance: "give me flights on american airlines from milwaukee to phoenix",
    },

    
];

const title = "Text to SQL";
const description = (
  <span>
    <span>
    Natural language to SQL interfaces allow users to query data in relational databases without writing
    SQL queries. This demo is an implementation of an encoder-decoder architecture with LSTMs and <a href="https://www.semanticscholar.org/paper/Neural-Semantic-Parsing-with-Type-Constraints-for-Krishnamurthy-Dasigi/8c6f58ed0ebf379858c0bbe02c53ee51b3eb398a"> constrained type decoding </a>
    trained on the <a href="https://www.semanticscholar.org/paper/The-ATIS-Spoken-Language-Systems-Pilot-Corpus-Hemphill-Godfrey/1d19708290ef3cc3f43c2c95b07acdd4f52f5cda"> ATIS </a>
    dataset.  This model is still a proof-of-concept of what you can do with semantic parsing in AllenNLP
    and doesn't have super great performance yet.
    </span>
  </span>
);


class AtisInput extends React.Component {
constructor(props) {
    super(props);

    const { utterance } = props;

    this.state = {
      utteranceValue: utterance || ""
    };
    this.handleListChange = this.handleListChange.bind(this);
    this.handleUtteranceChange = this.handleUtteranceChange.bind(this);
}

handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
          utteranceValue: parserExamples[e.target.value].utterance,
      });
    }
}


handleUtteranceChange(e) {
    this.setState({
    utteranceValue: e.target.value,
    });
}

render() {

    const { utteranceValue } = this.state;
    const { outputState, runParser } = this.props;

    const parserInputs = {
    "utteranceValue": utteranceValue
    };

    return (
        <div className="model__content">
        <ModelIntro title={title} description={description} />
            <div className="form__instructions"><span>Enter text or</span>
            <select disabled={outputState === "working"} onChange={this.handleListChange}>
                <option value="">Choose an example...</option>
                {parserExamples.map((example, index) => {
                  return (
                      <option value={index} key={index}>{example.utterance.substring(0,60) + "..."}</option>
                  );
                })}
            </select>
            </div>
            <div className="form__field">
            <label htmlFor="#input--mc-question">Utterance</label>
            <input onChange={this.handleUtteranceChange} id="input--mc-question" type="text" required="true" value={utteranceValue} placeholder="show me the flights from detroit to westchester county" disabled={outputState === "working"} />
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
      const { actions, entities, linking_scores, predicted_sql_query, tokenized_utterance} = this.props;

      return (
        <div className="model__content">

          <div className="form__field">
            <label>SQL Query</label>
              {predicted_sql_query.length > 0 ?
                <SyntaxHighlight>{predicted_sql_query}</SyntaxHighlight>
                :
                <p>No query found!</p>
              }
          </div>

          {predicted_sql_query.length > 0 ?
            <div className="form__field">
              <Collapsible trigger="Model internals (beta)">
                <Collapsible trigger="Predicted actions">
                  {actions.map((action, action_index) => (
                    <Collapsible key={"action_" + action_index} trigger={action['predicted_action']}>
                      <ActionInfo action={action} tokenized_utterance={tokenized_utterance}/>
                    </Collapsible>
                  ))}
                </Collapsible>
                <Collapsible trigger="Entity linking scores">
                    <HeatMap xLabels={tokenized_utterance} yLabels={entities} data={linking_scores} xLabelWidth={250} />
                </Collapsible>
              </Collapsible>
            </div>
            :
            <div></div>
          }

        </div>
      );
    }
  }


class ActionInfo extends React.Component {
  render() {
    const { action, tokenized_utterance } = this.props;
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
         <HeatMap xLabels={['Prob']} yLabels={tokenized_utterance} data={utterance_attention} xLabelWidth={70} />
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
  <AtisComponent /> Component
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
        utterance: inputs.utteranceValue,
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

      const utterance = requestData && requestData.utterance;
      const predicted_sql_query = responseData && responseData.predicted_sql_query;
      const actions = responseData && responseData.predicted_actions;
      const linking_scores = responseData && responseData.linking_scores;
      const entities = responseData && responseData.entities;
      const tokenized_utterance = responseData && responseData.tokenized_utterance;


      return (
        <div className="pane model">
          <PaneLeft>
            <AtisInput runParser={this.runParser}
                             outputState={this.state.outputState}
                             utterance={utterance}/>
          </PaneLeft>
          <PaneRight outputState={this.state.outputState}>
            <AtisOutput predicted_sql_query={predicted_sql_query}
                        actions={actions}
                        linking_scores={linking_scores}
                        entities={entities}
                        tokenized_utterance={tokenized_utterance}
            />
          </PaneRight>
        </div>
      );

    }
}

const AtisComponent = withRouter(_AtisComponent);

export default AtisComponent;
