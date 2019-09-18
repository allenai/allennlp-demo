import React from 'react';
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import { Accordion } from 'react-accessible-accordion';
import SaliencyComponent from '../Saliency'
import InputReductionComponent from '../InputReduction'
import HotflipComponent from '../Hotflip'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER,
  HOTFLIP_ATTACKER
} from '../InterpretConstants'

// APIs. These link to the functions in app.py
const apiUrl = () => `${API_ROOT}/predict/sentiment-analysis`
const apiUrlInterpret = () => `${API_ROOT}/interpret/sentiment-analysis`
const apiUrlAttack = () => `${API_ROOT}/attack/sentiment-analysis`

// title of the page
const title = "Sentiment Analysis"

const NAME_OF_INPUT_TO_ATTACK = "tokens"
const NAME_OF_GRAD_INPUT = "grad_input_1"

// Text shown in the UI
const description = (
  <span> Sentiment Analysis predicts whether an input is positive or negative. The model is a simple LSTM using GloVe embeddings that is trained on the binary classification setting of the <a href="https://nlp.stanford.edu/sentiment/treebank.html">Stanford Sentiment Treebank</a>. It achieves about 87% accuracy on the test set.</span>
);
const descriptionEllipsed = (
  <span> Sentiment Analysis predicts whether an input is positive or negative… </span>
);

// Input fields to the model.
const fields = [
  {name: "sentence", label: "Input", type: "TEXT_INPUT",
   placeholder: 'E.g. "amazing movie"'}
]

const getGradData = ({ grad_input_1: gradInput1 }) => {
  return [gradInput1];
}

const SaliencyMaps = ({interpretData, tokens, interpretModel, requestData}) => {
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
  return (
    <OutputField>
      <Accordion accordion={false}>
        <SaliencyComponent interpretData={simpleGradData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel(requestData, GRAD_INTERPRETER)} interpreter={GRAD_INTERPRETER} />
        <SaliencyComponent interpretData={integratedGradData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel(requestData, IG_INTERPRETER)} interpreter={IG_INTERPRETER} />
        <SaliencyComponent interpretData={smoothGradData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel(requestData, SG_INTERPRETER)} interpreter={SG_INTERPRETER}/>
      </Accordion>
    </OutputField>
  )
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
    <OutputField>
      <Accordion accordion={false}>
        <InputReductionComponent reducedInput={reducedInput} reduceFunction={attackModel(requestData, INPUT_REDUCTION_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        <HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
      </Accordion>
    </OutputField>
  )
}

// What is rendered as Output when the user hits buttons on the demo.
const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const [positiveClassProbability, negativeClassProbability] = responseData['probs']
  const prediction = negativeClassProbability < positiveClassProbability ? "Positive" : "Negative"

  let t = requestData;
  const tokens = t['sentence'].split(' '); // this model expects space-separated inputs

  // The "Answer" output field has the models predictions. The other output fields are the
  // reusable HTML/JavaScript for the interpretation methods.
  return (
    <div className="model__content answer">
      <OutputField label="Answer">
        {prediction}
      </OutputField>

    <OutputField>
      <Accordion accordion={false}>
          <SaliencyMaps interpretData={interpretData} tokens={tokens} interpretModel={interpretModel} requestData={requestData}/>
          <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData}/>
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

// A call to a pre-existing model component that handles all of the inputs and outputs. We just need to pass it the things we've already defined as props:
const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, descriptionEllipsed, fields, examples, Output}
export default withRouter(props => <Model {...props} {...modelProps}/>)
