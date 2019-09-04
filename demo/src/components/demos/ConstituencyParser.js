import React from 'react';
import { ExternalLink } from '@allenai/varnish/components';
import { withRouter } from 'react-router-dom';

import { API_ROOT } from '../../api-config';
import Model from '../Model'
import { Tree } from 'hierplane';
import { UsageSection } from '../UsageSection';
import { UsageHeader } from '../UsageHeader';
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';

const title = "Constituency Parsing";

const description = (
  <span>
    <span>
      A constituency parse tree breaks a text into sub-phrases, or constituents. Non-terminals in the tree are types of phrases, the terminals are the words in the sentence.
      This demo is an implementation of a minimal neural model for constituency parsing based on an independent scoring of labels and spans described in
    </span>
    <ExternalLink href="http://arxiv.org/abs/1805.06556" target="_blank" rel="noopener">{' '} Extending a Parser to Distant Domains Using a Few Dozen Partially Annotated Examples (Joshi et al, 2018)</ExternalLink>
    <span>
      . This model uses <ExternalLink href="https://arxiv.org/abs/1802.05365">ELMo embeddings</ExternalLink>, which are completely character based and improves single model performance from 92.6 F1 to 94.11 F1 on the Penn Treebank, a 20% relative error reduction.
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

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"sentence": "If I bring 10 dollars tomorrow, can you buy me lunch?"}' | \\
  allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz -`}
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/elmo-constituency-parser-2018.03.14.tar.gz")
predictor.predict(
  sentence="If I bring 10 dollars tomorrow, can you buy me lunch?"
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <p>
        The constituency parser was evaluated on the Penn Tree Bank dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
      </p>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <p>
        The constituency parser was evaluated on the Penn Tree Bank dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
      </p>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output, usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
