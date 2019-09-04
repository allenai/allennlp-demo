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


const title = "Dependency Parsing";

const description = (
  <span>
    <span>
    A dependency parser analyzes the grammatical structure of a sentence, establishing relationships between "head" words and words which modify those heads.
    This demo is an implementation of a neural model for dependency parsing using biaffine classifiers on top of a bidirectional LSTM based on
    </span>
    <ExternalLink href="https://arxiv.org/abs/1611.01734" target="_blank" rel="noopener">{' '} Deep Biaffine Attention for Neural Dependency Parsing (Dozat, 2017).</ExternalLink>
  <span>
  The parser is trained on the PTB 3.0 dataset using Stanford dependencies, achieving 95.57% and 94.44% unlabeled and labeled attachement score using gold POS tags. For predicted POS tags, the model achieves 94.81% UAS and 92.86% LAS respectively.
  </span>
  </span>
)

const descriptionEllipsed = (
<span>
    A dependency parser analyzes the grammatical structure of a sentence, establishing relationships between…
</span>
)

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "John likes and Bill hates ice cream."`}
]

const HierplaneVisualization = ({tree}) => {
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

const Output = ({ responseData }) => (
    <HierplaneVisualization tree={responseData.hierplane_tree} />
)

const examples = [
    "James ate some cheese whilst thinking about the play.",
    "She decided not to take the house she'd viewed yesterday.",
    "The proportion of PepsiCo’s revenue coming from healthier food and beverages has risen from 38% in 2006 to 50%.",
    "CRISPR-Cas9 is a versatile genome editing technology for studying the functions of genetic elements."
  ].map(sentence => ({sentence}))

const apiUrl = () => `${API_ROOT}/predict/dependency-parsing`

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"sentence": "If I bring 10 dollars tomorrow, can you buy me lunch?"}' | \\
  allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/biaffine-dependency-parser-ptb-2018.08.23.tar.gz -`} />
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/biaffine-dependency-parser-ptb-2018.08.23.tar.gz")
predictor.predict(
  sentence="If I bring 10 dollars tomorrow, can you buy me lunch?"
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <p>
        The dependency parser was evaluated on the Penn Tree Bank dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
      </p>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <p>
        The dependency parser was evaluated on the Penn Tree Bank dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
      </p>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output, usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
