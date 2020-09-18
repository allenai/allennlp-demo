import React from 'react';
import { withRouter } from 'react-router-dom';

import Model from '../Model'
import { Tree } from 'hierplane';

const title = "Dependency Parsing";

const description = (
  <span>
    <p>
      Dependency parsing is the task of analyzing the grammatical structure of a sentence and establishing the relationships between "head" words and the words which modify those heads.
    </p>
    <p>
      This demo is an implementation of a neural model for dependency parsing using biaffine classifiers on top of a bidirectional LSTM based
      on <a href="https://arxiv.org/abs/1611.01734" target="_blank" rel="noopener noreferrer">{' '} Deep Biaffine Attention for Neural Dependency Parsing (Dozat, 2017).</a><br />
      The parser is trained on the PTB 3.0 dataset using Stanford dependencies, achieving 95.57% and 94.44% unlabeled and labeled attachement score using gold POS tags. For predicted POS tags, the model achieves 94.81% UAS and 92.86% LAS respectively.
    </p>
  </span>
)

const modelUrl = "https://storage.googleapis.com/allennlp-public-models/biaffine-dependency-parser-ptb-2020.04.06.tar.gz"

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
    The dependency parser was evaluated on the Penn Tree Bank dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
  </span>),
  trainingNote: (<span>
    The dependency parser was evaluated on the Penn Tree Bank dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can download the PTB data from <a href="https://catalog.ldc.upenn.edu/ldc99t42">the LDC website</a>.
  </span>)
}

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

const apiUrl = () => `/api/dependency-parser/predict`

const modelProps = {apiUrl, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
