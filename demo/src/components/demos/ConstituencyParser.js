import React from 'react';
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import { Tree } from 'hierplane';

const title = "Constituency Parsing";

const description = (
  <span>
    <span>
      A constituency parse tree breaks a text into sub-phrases, or constituents. Non-terminals in the tree are types of phrases, the terminals are the words in the sentence.
      This demo is an implementation of a minimal neural model for constituency parsing based on an independent scoring of labels and spans described in
    </span>
    <a href="http://arxiv.org/abs/1805.06556" target="_blank" rel="noopener noreferrer">{' '} Extending a Parser to Distant Domains Using a Few Dozen Partially Annotated Examples (Joshi et al, 2018)</a>
    <span>
      . This model uses <a href="https://arxiv.org/abs/1802.05365">ELMo embeddings</a>, which are completely character based and improves single model performance from 92.6 F1 to 94.11 F1 on the Penn Treebank, a 20% relative error reduction.
    </span>
  </span>
);

const descriptionEllipsed = (
  <span>
    A constituency parse tree breaks a text into sub-phrases, or constituents. Non-terminals in the tree are types of…
  </span>
)

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "John likes and Bill hates ice cream."`}
]

const HierplaneVisualization = ({ tree }) => {
    if (tree) {
        return (
            <div className="hierplane__visualization">
              <Tree tree={tree} theme="light" />
            </div>
          )
    } else {
        return null;
    }
}

const Output = ({ responseData }) => {
    return <HierplaneVisualization tree={responseData.hierplane_tree} />
}

const examples = [
    "Pierre Vinken died aged 81; immortalised aged 61.",
    "James went to the corner shop to buy some eggs, milk and bread for breakfast.",
    "If you bring $10 with you tomorrow, can you pay for me to eat too?",
    "True self-control is waiting until the movie starts to eat your popcorn.",
  ].map(sentence => ({sentence}))

const apiUrl = () => `${API_ROOT}/predict/constituency-parsing`

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
