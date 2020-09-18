import React from 'react';
import { withRouter } from 'react-router-dom';

import Model from '../Model'
import { Tree } from 'hierplane';

const title = "Constituency Parsing";

const description = (
  <span>
    <p>
      Constituency parsing is the task of breaking a text into sub-phrases, or constituents. Non-terminals in the parse tree are types of phrases, the terminals are the words in the sentence.
    </p>
    <p>
      This demo is an implementation of a minimal neural model for constituency parsing based on an independent scoring of labels and spans described
      in <a href="http://arxiv.org/abs/1805.06556">Extending a Parser to Distant Domains Using a Few Dozen Partially Annotated Examples (Joshi et al, 2018)</a>. <br />This model uses <a href="https://arxiv.org/abs/1802.05365">ELMo embeddings</a>, which are completely character based and improves single model performance from 92.6 F1 to 94.11 F1 on the Penn Treebank, a 20% relative error reduction.
    </p>
  </span>
);

const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/elmo-constituency-parser-2020.02.10.tar.gz'

const bashCommand =
    `echo '{"sentence": "If I bring 10 dollars tomorrow, can you buy me lunch?"}' | \\
allennlp predict ${modelUrl} -`

const pythonCommand =
    `from allennlp.predictors.predictor import Predictor
import allennlp_models.structured_prediction
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  sentence="If I bring 10 dollars tomorrow, can you buy me lunch?"
)`

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const defaultUsage = {
  installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
  bashCommand,
  pythonCommand,
  evaluationNote: (<span>
    The constituency parser was evaluated on the Penn Tree Bank dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
  </span>),
  trainingNote: (<span>
    The constituency parser was evaluated on the Penn Tree Bank dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
  </span>)
}

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

const apiUrl = () => `/api/constituency-parser/predict`

const modelProps = {apiUrl, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
