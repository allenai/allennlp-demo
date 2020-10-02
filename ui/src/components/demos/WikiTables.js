import React from 'react';
import styled from 'styled-components';
import { Collapse } from '@allenai/varnish';

import HeatMap from '../HeatMap'
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import SyntaxHighlight from '../highlight/SyntaxHighlight.js';

const title = "WikiTables Semantic Parsing";

const description = (
  <span>
    <span>
      Semantic parsing maps natural language to machine language.  This page demonstrates a semantic
      parsing model on the
      <a href="https://nlp.stanford.edu/software/sempre/wikitable/">{' '}WikiTableQuestions</a> dataset.
      The model is a re-implementation of the parser in the
      <a href="https://www.semanticscholar.org/paper/Iterative-Search-for-Weakly-Supervised-Semantic-Dasigi-Gardner/af17ccbdae4cbd1b67d6ab359615c8000f8fb66f">
      {' '}NAACL 2019 paper by Dasigi, Gardner, Murty, Zettlemoyer, and Hovy</a>.
    </span>
  </span>
);

const fields = [
  {name: "table", label: "Table", type: "TEXT_AREA",
    placeholder: `E.g. "Season\tLevel\tDivision\tSection\tPosition\tMovements\n1993\tTier 3\tDivision 2\tÖstra Svealand\t1st\tPromoted\n1994\tTier 2\tDivision 1\tNorra\t11th\tRelegation Playoffs\n"`},
  {name: "question", label: "Question", type: "TEXT_INPUT",
    placeholder: `E.g. "What is the only year with the 1st position?"`},
  {name: "beamSearch", type: "BEAM_SEARCH", optional: true,
   // When we get fresh inputs to the model, we want to clear out the value of initial_sequence
   dependentInputs: ['initial_sequence'],
   // The beam search is an "input-output" and so should be rendered below the RUN button.
   inputOutput: true
  }
]

const ActionInfo = ({ action, question_tokens }) => {
  if (action['question_attention'] === "None") {
    action['question_attention'] = []
  }
  const question_attention = action['question_attention'].map(x => [x]);
  const considered_actions = action['considered_actions'];
  const action_probs = action['action_probabilities'].map(x => [x]);

  const probability_heatmap = (
    <div className="heatmap, heatmap-tile">
      <HeatMap colLabels={['Prob']} rowLabels={considered_actions} data={action_probs} />
    </div>
  )

  const question_attention_heatmap = question_attention.length > 0 ? (
    <div className="heatmap, heatmap-tile">
      <HeatMap colLabels={['Prob']} rowLabels={question_tokens} data={question_attention} />
    </div>
  ) : (
    ""
  )

  return (
    <div className="flex-container">
      {probability_heatmap}
      {question_attention_heatmap}
    </div>
  )
}

const Output = ({ responseData }) => {
    const { answer, logical_form, predicted_actions, linking_scores, feature_scores, similarity_scores, entities, question_tokens } = responseData

    return (
      <div className="model__content answer">
        <OutputField label="Answer">
          { answer }
        </OutputField>

        <OutputField label="Logical Form">
          <SyntaxHighlight language="lisp">
              {logical_form[0].toString()}
          </SyntaxHighlight>
        </OutputField>

        <OutputField label="Model internals">
          <Collapse defaultActiveKey={['default']}>
            <Collapse.Panel header="Predicted production rules" key="default">
              <PanelDesc>
                The sequence of grammar production rules predicted by the model, which together determine an
                abstract syntax tree for the program shown above.
              </PanelDesc>
              {(predicted_actions || []).map((action, action_index) => (
                <Collapse key={"action_" + action_index}>
                  <Collapse.Panel header={action['predicted_action']}>
                      <ActionInfo action={action} question_tokens={question_tokens}/>
                  </Collapse.Panel>
                </Collapse>
              ))}
            </Collapse.Panel>
            <Collapse.Panel header="Entity linking scores">
              <HeatMap colLabels={question_tokens} rowLabels={entities} data={linking_scores} normalization="log-per-row-with-zero" />
            </Collapse.Panel>
            {feature_scores &&
              <Collapse.Panel header="Entity linking scores (features only)">
                <HeatMap colLabels={question_tokens} rowLabels={entities} data={feature_scores} normalization="log-per-row-with-zero" />
              </Collapse.Panel>
            }
            <Collapse.Panel header="Entity linking scores (similarity only)">
              <HeatMap colLabels={question_tokens} rowLabels={entities} data={similarity_scores} normalization="log-per-row-with-zero" />
            </Collapse.Panel>
          </Collapse>
        </OutputField>
      </div>
    )
}

const PanelDesc = styled.div`
  margin-bottom: ${({theme}) => theme.spacing.sm};
`;

const examples = [
    {
      table: "#\tEvent Year\tSeason\tFlag bearer\n" +
             "7\t2012\tSummer\tEle Opeloge\n" +
             "6\t2008\tSummer\tEle Opeloge\n" +
             "5\t2004\tSummer\tUati Maposua\n" +
             "4\t2000\tSummer\tPauga Lalau\n" +
             "3\t1996\tSummer\tBob Gasio\n" +
             "2\t1988\tSummer\tHenry Smith\n" +
             "1\t1984\tSummer\tApelu Ioane",
      question: "How many years were held in summer?\n",
    },
    {
      table: "Season\tLevel\tDivision\tSection\tPosition\tMovements\n" +
             "1993\tTier 3\tDivision 2\tÖstra Svealand\t1st\tPromoted\n" +
             "1994\tTier 2\tDivision 1\tNorra\t11th\tRelegation Playoffs\n" +
             "1995\tTier 2\tDivision 1\tNorra\t4th\t\n" +
             "1996\tTier 2\tDivision 1\tNorra\t11th\tRelegation Playoffs - Relegated\n" +
             "1997\tTier 3\tDivision 2\tÖstra Svealand\t3rd\t\n" +
             "1998\tTier 3\tDivision 2\tÖstra Svealand\t7th\t\n" +
             "1999\tTier 3\tDivision 2\tÖstra Svealand\t3rd\t\n" +
             "2000\tTier 3\tDivision 2\tÖstra Svealand\t9th\t\n" +
             "2001\tTier 3\tDivision 2\tÖstra Svealand\t7th\t\n" +
             "2002\tTier 3\tDivision 2\tÖstra Svealand\t2nd\t\n" +
             "2003\tTier 3\tDivision 2\tÖstra Svealand\t3rd\t\n" +
             "2004\tTier 3\tDivision 2\tÖstra Svealand\t6th\t\n" +
             "2005\tTier 3\tDivision 2\tÖstra Svealand\t4th\tPromoted\n" +
             "2006*\tTier 3\tDivision 1\tNorra\t5th\t\n" +
             "2007\tTier 3\tDivision 1\tSödra\t14th\tRelegated",
      question: "What is the only season with the 1st position?",
    },
];

const apiUrl = () => `/api/wikitables-parser/predict`

const modelProps = {apiUrl, title, description, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
