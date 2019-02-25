import React from 'react';
import HeatMap from '../HeatMap'
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
  } from 'react-accessible-accordion';
import { API_ROOT } from '../../api-config';
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
      <a href="https://www.semanticscholar.org/paper/Neural-Semantic-Parsing-with-Type-Constraints-for-Krishnamurthy-Dasigi/8c6f58ed0ebf379858c0bbe02c53ee51b3eb398a">
      {' '}EMNLP 2017 paper by Krishnamurthy, Dasigi and Gardner</a>, which achieved state-of-the-art results
      on this dataset at the time.  This model is still a proof-of-concept of what you can do with
      semantic parsing in AllenNLP and its performance is not state-of-the-art (this model gets somewhere around 37-40% accuracy).
    </span>
  </span>
);

const descriptionEllipsed = (
  <span>
    Semantic parsing maps natural language to machine language.  This page demonstrates a semantic parsing…
  </span>
)

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

        <OutputField label="Logical Form" suppressSummary="true">
          <SyntaxHighlight language="lisp">
              {logical_form.split('fb:').join('').split('.').join('-')}
          </SyntaxHighlight>
        </OutputField>

        <OutputField label="Model internals">
          <Accordion accordion={false}>
            <AccordionItem expanded={true}>
              <AccordionItemTitle>
                Predicted actions
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                {(predicted_actions || []).map((action, action_index) => (
                  <Accordion accordion={false} key={"action_" + action_index}>
                    <AccordionItem>
                      <AccordionItemTitle>
                        {action['predicted_action']}
                        <div className="accordion__arrow" role="presentation"/>
                      </AccordionItemTitle>
                      <AccordionItemBody>
                        <ActionInfo action={action} question_tokens={question_tokens}/>
                      </AccordionItemBody>
                    </AccordionItem>
                  </Accordion>
                ))}
              </AccordionItemBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionItemTitle>
                Entity linking scores
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                <HeatMap colLabels={question_tokens} rowLabels={entities} data={linking_scores} normalization="log-per-row-with-zero" />
              </AccordionItemBody>
            </AccordionItem>
            {feature_scores &&
              <AccordionItem>
                <AccordionItemTitle>
                  Entity linking scores (features only)
                  <div className="accordion__arrow" role="presentation"/>
                </AccordionItemTitle>
                <AccordionItemBody>
                  <HeatMap colLabels={question_tokens} rowLabels={entities} data={feature_scores} normalization="log-per-row-with-zero" />
                </AccordionItemBody>
              </AccordionItem>
            }
            <AccordionItem>
              <AccordionItemTitle>
                Entity linking scores (similarity only)
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                <HeatMap colLabels={question_tokens} rowLabels={entities} data={similarity_scores} normalization="log-per-row-with-zero" />
              </AccordionItemBody>
            </AccordionItem>
          </Accordion>
        </OutputField>
      </div>
    )
}

const examples = [
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
];

const apiUrl = () => `${API_ROOT}/predict/wikitables-parser`

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
