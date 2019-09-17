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
const apiUrlInterpret = ({interpreter}) => `${API_ROOT}/interpret/sentiment-analysis/${interpreter}`
const apiUrlAttack = ({attacker, name_of_input_to_attack, name_of_grad_input}) => `${API_ROOT}/attack/sentiment-analysis/${attacker}/${name_of_input_to_attack}/${name_of_grad_input}`

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

const get_grad_data = ({ grad_input_1, grad_input_2 }) => {
  // Not sure why, but it appears that the order of the gradients is reversed for these.
  return [grad_input_1];
}

const SaliencyMaps = ({interpretData, tokens, interpretModel, requestData}) => {
  var simple_grad_data = undefined;
  var integrated_grad_data = undefined;
  var smooth_grad_data = undefined;
  if (interpretData) {
    simple_grad_data = GRAD_INTERPRETER in interpretData ? get_grad_data(interpretData[GRAD_INTERPRETER]['instance_1']) : undefined
    integrated_grad_data = IG_INTERPRETER in interpretData ? get_grad_data(interpretData[IG_INTERPRETER]['instance_1']) : undefined
    smooth_grad_data = SG_INTERPRETER in interpretData ? get_grad_data(interpretData[SG_INTERPRETER]['instance_1']) : undefined
  }
  const inputTokens = [tokens];
  const inputHeaders = [<p><strong>Sentence:</strong></p>];
  return (
    <OutputField>
      <Accordion accordion={false}>
        <SaliencyComponent interpretData={simple_grad_data} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} interpreter={GRAD_INTERPRETER} />
        <SaliencyComponent interpretData={integrated_grad_data} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} interpreter={IG_INTERPRETER} />
        <SaliencyComponent interpretData={smooth_grad_data} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} interpreter={SG_INTERPRETER}/>
      </Accordion>
    </OutputField>
  )
}

const Attacks = ({attackData, attackModel, requestData}) => {
  var hotflip_data = undefined;
  if (attackData && "hotflip" in attackData) {
    hotflip_data = attackData["hotflip"];
    const [pos, neg] = hotflip_data["outputs"]["probs"]
    hotflip_data["new_prediction"] = pos > neg ? 'Positive' : 'Negative'
  }
  var reduced_input = undefined;
  if (attackData && "input_reduction" in attackData) {
    const reduction_data = attackData["input_reduction"];
    reduced_input = {original: reduction_data["original"], reduced: [reduction_data["final"][0]]};
  }
  return (
    <OutputField>
      <Accordion accordion={false}>
        <InputReductionComponent reduced_input={reduced_input} reduceFunction={attackModel} requestDataObject={requestData} attacker={INPUT_REDUCTION_ATTACKER} nameOfInputToAttack={NAME_OF_INPUT_TO_ATTACK} nameOfGradInput={NAME_OF_GRAD_INPUT}/>
        <HotflipComponent hotflipData={hotflip_data} hotflipFunction={attackModel} requestDataObject={requestData} attacker={HOTFLIP_ATTACKER} nameOfInputToAttack={NAME_OF_INPUT_TO_ATTACK} nameOfGradInput={NAME_OF_GRAD_INPUT}/>
      </Accordion>
    </OutputField>
  )
}

// What is rendered as Output when the user hits buttons on the demo.
const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const [positiveClassProbability, negativeClassProbability] = responseData['probs']
  const prediction = negativeClassProbability < positiveClassProbability ? "Positive" : "Negative"

  var t = requestData;
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
          <Attacks attackData={attackData} attackModel = {attackModel} requestData = {requestData}/>
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
