import React from 'react';
import { API_ROOT } from '../../api-config';
import { UsageSection } from '../UsageSection';
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import { Accordion } from 'react-accessible-accordion';
import SaliencyMaps from '../Saliency'
import InputReductionComponent from '../InputReduction'
import HotflipComponent from '../Hotflip'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER,
  HOTFLIP_ATTACKER
} from '../InterpretConstants'

// title of the page
const title = "Sentiment Analysis"

const NAME_OF_INPUT_TO_ATTACK = "tokens"
const NAME_OF_GRAD_INPUT = "grad_input_1"

// Text shown in the UI
const description = (
  <span>
    <span>
    Sentiment Analysis predicts whether an input is positive or negative. The two models are based
    on GloVe embeddings and <a href="https://arxiv.org/pdf/1907.11692.pdf">RoBERTa large</a>,
    respectively, and are trained on the binary classification setting of
    the <a href="https://nlp.stanford.edu/sentiment/treebank.html">Stanford Sentiment Treebank</a>.
    They achieve about 87% and 95.11% accuracy on the test set.
    </span>
    <p>
      <b>Contributed by:</b> Zhaofeng Wu
    </p>
  </span>
);
const descriptionEllipsed = (
  <span> Sentiment Analysis predicts whether an input is positive or negative… </span>
);

const taskModels = [
  {
    name: "GloVe-LSTM",
    desc: "Using GloVe embeddings and an LSTM layer."
  },
  {
    name: "RoBERTa",
    desc: "Using RoBERTa embeddings."
  }
]

const taskEndpoints = {
  "GloVe-LSTM": "glove-sentiment-analysis",
  "RoBERTa": "roberta-sentiment-analysis"
};

// Input fields to the model.
const fields = [
  {name: "sentence", label: "Input", type: "TEXT_INPUT",
   placeholder: 'E.g. "amazing movie"'},
  {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: true}
]

const getUrl = (model, apiCall) => {
  const selectedModel = model || (taskModels[0] && taskModels[0].name);
  const endpoint = taskEndpoints[selectedModel]
  return `${API_ROOT}/${apiCall}/${endpoint}`
}

const apiUrl = ({model}) => {
  return getUrl(model, "predict")
}

const apiUrlInterpret = ({model}) => {
  return getUrl(model, "interpret")
}

const apiUrlAttack = ({model}) => {
  return getUrl(model, "attack")
}

const getGradData = ({ grad_input_1: gradInput1 }) => {
  return [gradInput1];
}

const MySaliencyMaps = ({interpretData, tokens, interpretModel, requestData}) => {
  let simpleGradData = undefined;
  let integratedGradData = undefined;
  let smoothGradData = undefined;
  if (interpretData) {
    simpleGradData = GRAD_INTERPRETER in interpretData ? getGradData(interpretData[GRAD_INTERPRETER]['instance_1']) : undefined
    integratedGradData = IG_INTERPRETER in interpretData ? getGradData(interpretData[IG_INTERPRETER]['instance_1']) : undefined
    smoothGradData = SG_INTERPRETER in interpretData ? getGradData(interpretData[SG_INTERPRETER]['instance_1']) : undefined
  }
  const inputTokens = [tokens];
  const inputHeaders = [<p><strong>Sentence:</strong></p>];
  const allInterpretData = {simple: simpleGradData, ig: integratedGradData, sg: smoothGradData};
  return <SaliencyMaps interpretData={allInterpretData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} />
}

const Attacks = ({attackData, attackModel, requestData}) => {
  let hotflipData = undefined;
  if (attackData && "hotflip" in attackData) {
    hotflipData = attackData["hotflip"];
    const [pos, neg] = hotflipData["outputs"]["probs"]
    hotflipData["new_prediction"] = pos > neg ? 'Positive' : 'Negative'
  }
  let reducedInput = undefined;
  if (attackData && "input_reduction" in attackData) {
    const reductionData = attackData["input_reduction"];
    reducedInput = {original: reductionData["original"], reduced: [reductionData["final"][0]]};
  }
  return (
    <OutputField label="Model Attacks">
      <Accordion accordion={false}>
        <InputReductionComponent reducedInput={reducedInput} reduceFunction={attackModel(requestData, INPUT_REDUCTION_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        <HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
      </Accordion>
    </OutputField>
  )
}

// What is rendered as Output when the user hits buttons on the demo.
const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const model = requestData ? requestData.model : undefined;

  const [positiveClassProbability, negativeClassProbability] = responseData['probs']
  const prediction = negativeClassProbability < positiveClassProbability ? "Positive" : "Negative"

  let t = requestData;
  const tokens = t['sentence'].split(' '); // this model expects space-separated inputs

  // The RoBERTa-large model is very slow to be attacked
  const attacks = model && model.includes('RoBERTa') ?
    " "
  :
    <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData}/>

  // The "Answer" output field has the models predictions. The other output fields are the
  // reusable HTML/JavaScript for the interpretation methods.
  return (
    <div className="model__content answer">
      <OutputField label="Answer">
        {prediction}
      </OutputField>

    <OutputField>
      <Accordion accordion={false}>
          <MySaliencyMaps interpretData={interpretData} tokens={tokens} interpretModel={interpretModel} requestData={requestData}/>
          {attacks}
      </Accordion>
    </OutputField>
  </div>
  );
}

// Examples the user can choose from in the demo
const examples = [
  { sentence: "a very well-made, funny and entertaining picture." },
  { sentence: "so unremittingly awful that labeling it a dog probably constitutes cruelty to canines" },
  { sentence: "all the amped up tony hawk style stunts and thrashing rap-metal can't disguise the fact that, really, we've been here, done that."},
  { sentence: "visually imaginative, thematically instructive and thoroughly delightful, it takes us on a roller-coaster ride from innocence to experience without even a hint of that typical kiddie-flick sentimentality."}
]

const usage = (
  <React.Fragment>
    <UsageSection>
      <h3>Prediction</h3>
      <h5>On the command line (bash):</h5>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"sentence": "a very well-made, funny and entertaining picture."}' | \\
allennlp predict https://storage.googleapis.com/allennlp-public-models/sst-roberta-large-2020.02.17.tar.gz -`}
        </SyntaxHighlight>
      </UsageCode>
      <h5>As a library (Python):</h5>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://storage.googleapis.com/allennlp-public-models/sst-roberta-large-2020.02.17.tar.gz")
predictor.predict(
  sentence="a very well-made, funny and entertaining picture."
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <h3>Evaluation</h3>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`allennlp evaluate \\
  https://storage.googleapis.com/allennlp-public-models/sst-roberta-large-2020.02.17.tar.gz \\
  https://s3-us-west-2.amazonaws.com/allennlp/datasets/sst/dev.txt`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <h3>Training</h3>
      <UsageCode>
        <SyntaxHighlight language="python">
          allennlp train training_config/basic_stanford_sentiment_treebank.jsonnet -s output_path
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
  </React.Fragment>
)

// A call to a pre-existing model component that handles all of the inputs and outputs. We just need to pass it the things we've already defined as props:
const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, descriptionEllipsed, fields, examples, Output, usage}
export default withRouter(props => <Model {...props} {...modelProps}/>)
