import React from 'react';
import styled from 'styled-components';
import { Collapse } from '@allenai/varnish';
import { withRouter } from 'react-router-dom';

import HeatMap from '../HeatMap'
import Model from '../Model'
import OutputField from '../OutputField'
import SyntaxHighlight from '../highlight/SyntaxHighlight.js';

const title = "NLVR Semantic Parsing";

const description = (
  <span>
    <span>
      Semantic parsing maps natural language to machine language.  This page demonstrates a semantic
      parsing model on the
      <a href="http://lic.nlp.cornell.edu/nlvr/">{' '}Cornell NLVR</a> dataset.
      The model is the one described in the
      <a href="https://www.semanticscholar.org/paper/Iterative-Search-for-Weakly-Supervised-Semantic-Dasigi-Gardner/af17ccbdae4cbd1b67d6ab359615c8000f8fb66f">
      {' '}NAACL 2019 paper by Dasigi, Gardner, Murty, Zettlemoyer, and Hovy</a>.

      The structured representation is not particularly useful here, unless you know what you're doing.
      We recommend just seeing how the sentence maps to a logical form.
    </span>
  </span>
);

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "There is a tower with a blue block over a yellow block"`},
    {name: "structured_rep", label: "Structured (JSON) Representation", type: "TEXT_AREA",
      placeholder: `E.g. "[[{"y_loc":80,"type":"triangle","color":"#0099ff","x_loc":80,"size":20},{"y_loc":47...]]`}
]



const ActionInfo = ({ action, sentence_tokens }) => {
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
          <HeatMap colLabels={['Prob']} rowLabels={sentence_tokens} data={question_attention} />
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
    const { denotations, logical_form, predicted_actions, sentence_tokens } = responseData

    return (
        <div className="model__content answer">
          <OutputField label="Answer">
            { denotations[0] }
          </OutputField>

          <OutputField label="Logical Form" suppressSummary>
            <SyntaxHighlight language="lisp">
                {logical_form}
            </SyntaxHighlight>
          </OutputField>

          <OutputField label="Model internals">
          <Collapse defaultActiveKey={['default']}>
            <Collapse.Panel header="Predicted production rules" key="default">
              <PanelDesc>
                The sequence of grammar production rules predicted by the model, which together determine an
                abstract syntax tree for the program shown above.
              </PanelDesc>
              {predicted_actions.map((action, action_index) => (
                <Collapse key={"action_" + action_index}>
                  <Collapse.Panel header={action['predicted_action']}>
                    <ActionInfo action={action} sentence_tokens={sentence_tokens}/>
                  </Collapse.Panel>
                  </Collapse>
                ))}
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
      structured_rep: `[[{"y_loc":13,"type":"square","color":"Yellow","x_loc":13,"size":20},{"y_loc":20,"type":"triangle","color":"Yellow","x_loc":44,"size":30},{"y_loc":90,"type":"circle","color":"#0099ff","x_loc":52,"size":10}],[{"y_loc":57,"type":"square","color":"Black","x_loc":17,"size":20},{"y_loc":30,"type":"circle","color":"#0099ff","x_loc":76,"size":10},{"y_loc":12,"type":"square","color":"Black","x_loc":35,"size":10}],[{"y_loc":40,"type":"triangle","color":"#0099ff","x_loc":26,"size":20},{"y_loc":70,"type":"triangle","color":"Black","x_loc":70,"size":30},{"y_loc":19,"type":"square","color":"Black","x_loc":35,"size":10}]]`,
      sentence: "there is exactly one yellow object touching the edge",
    },
    {
      structured_rep: `[[{"y_loc":13,"type":"square","color":"Yellow","x_loc":13,"size":20},{"y_loc":20,"type":"triangle","color":"Yellow","x_loc":44,"size":30},{"y_loc":90,"type":"circle","color":"#0099ff","x_loc":52,"size":10}],[{"y_loc":57,"type":"square","color":"Black","x_loc":17,"size":20},{"y_loc":30,"type":"circle","color":"#0099ff","x_loc":76,"size":10},{"y_loc":12,"type":"square","color":"Black","x_loc":35,"size":10}],[{"y_loc":40,"type":"triangle","color":"#0099ff","x_loc":26,"size":20},{"y_loc":70,"type":"triangle","color":"Black","x_loc":70,"size":30},{"y_loc":19,"type":"square","color":"Black","x_loc":35,"size":10}]]`,
      sentence: "there is exactly one yellow object above a black object",
    },
    {
      structured_rep: `[[{"y_loc":13,"type":"square","color":"Yellow","x_loc":13,"size":20},{"y_loc":20,"type":"triangle","color":"Yellow","x_loc":44,"size":30},{"y_loc":90,"type":"circle","color":"#0099ff","x_loc":52,"size":10}],[{"y_loc":57,"type":"square","color":"Black","x_loc":17,"size":20},{"y_loc":30,"type":"circle","color":"#0099ff","x_loc":76,"size":10},{"y_loc":12,"type":"square","color":"Black","x_loc":35,"size":10}],[{"y_loc":40,"type":"triangle","color":"#0099ff","x_loc":26,"size":20},{"y_loc":70,"type":"triangle","color":"Black","x_loc":70,"size":30},{"y_loc":19,"type":"square","color":"Black","x_loc":35,"size":10}]]`,
      sentence: "There is at least one black block on a blue block.",
    },
];

const apiUrl = () => `/api/nlvr-parser/predict`

const modelProps = {apiUrl, title, description, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
