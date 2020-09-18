import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Collapse } from '@allenai/varnish';

import Model from '../Model'
import OutputField from '../OutputField'
import SaliencyMaps from '../Saliency'
import InputReductionComponent, { InputReductionPanel } from '../InputReduction'
import HotflipComponent, { HotflipPanel } from '../Hotflip'
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
    Sentiment Analysis is the task of interpreting and classifying emotions (positive or negative) in the input text.
  </span>
);

const defaultUsage = undefined

const bashCommand = (modelUrl) => {
    return `echo '{"sentence": "a very well-made, funny and entertaining picture."}' | \\
allennlp predict ${modelUrl} -`
}

const pythonCommand = (modelUrl) => {
    return `from allennlp.predictors.predictor import Predictor
import allennlp_models.classification
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  sentence="a very well-made, funny and entertaining picture."
)`
}

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const buildUsage = (modelFile, configFile) => {
  const fullModelUrl = `https://storage.googleapis.com/allennlp-public-models/${modelFile}`;
  const fullConfigUrl = `https://raw.githubusercontent.com/allenai/allennlp-models/v1.0.0/training_config/classification/${configFile}`;
  return {
    installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
    bashCommand: bashCommand(fullModelUrl),
    pythonCommand: pythonCommand(fullModelUrl),
    evaluationCommand: `allennlp evaluate \\
    ${fullModelUrl} \\
    https://s3-us-west-2.amazonaws.com/allennlp/datasets/sst/dev.txt`,
    trainingCommand: `allennlp train ${fullConfigUrl} -s output_path`
  }
}

const taskModels = [
  {
    name: "GloVe-LSTM",
    desc: <span>This model uses GloVe embeddings and is trained on the binary classification setting of the <a href="https://nlp.stanford.edu/sentiment/treebank.html">Stanford Sentiment Treebank</a>.  It achieves about 87% on the test set.</span>,
    modelId: "glove-sentiment-analysis",
    usage: buildUsage("basic_stanford_sentiment_treebank-2020.06.09.tar.gz", "basic_stanford_sentiment_treebank.jsonnet")
  },
  {
    name: "RoBERTa",
    desc: <span>This model is trained on <a href="https://arxiv.org/pdf/1907.11692.pdf">RoBERTa large</a> with the binary classification setting of the <a href="https://nlp.stanford.edu/sentiment/treebank.html">Stanford Sentiment Treebank</a>.  It achieves 95.11% accuracy on the test set.
          <p><b>Contributed by:</b> <a href="https://zhaofengwu.github.io">Zhaofeng Wu</a></p>
   </span>,
    modelId: "roberta-sentiment-analysis",
    usage: buildUsage("sst-roberta-large-2020.06.08.tar.gz", "stanford_sentiment_treebank_roberta.jsonnet")
  }
]

// Input fields to the model.
const fields = [
  {name: "sentence", label: "Input", type: "TEXT_INPUT",
   placeholder: 'E.g. "amazing movie"'},
  {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: true}
]

const getUrl = (model, ...paths) => {
  const selectedModel = taskModels.find(t => t.name === model)
    || taskModels.find(t => t.modelId === model)
    || taskModels[0];
  return `/${['api', selectedModel.modelId, ...paths ].join('/')}`;
}

const apiUrl = ({ model }) => {
  return getUrl(model, "predict")
}

const apiUrlInterpret = ({ model }, interpreter) => {
  return getUrl(model, "interpret", interpreter)
}

const apiUrlAttack = ({ model }, attacker) => {
  return getUrl(model, "attack", attacker)
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
      <Collapse>
        <InputReductionPanel>
          <InputReductionComponent reducedInput={reducedInput} reduceFunction={attackModel(requestData, INPUT_REDUCTION_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        </InputReductionPanel>
        <HotflipPanel>
          <HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        </HotflipPanel>
      </Collapse>
    </OutputField>
  )
}

const textFromProbability = (prob) => {
  const probPosStr = Number(prob).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1});
  const probNegStr = Number(1-prob).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 1});
  if (prob < 0.2) {
      return <div>The model is quite sure the sentence is <Negative>Negative</Negative>. ({probNegStr})</div>;
  } else if (prob < 0.5) {
      return <div>The model thinks the sentence is <Negative>Negative</Negative>. ({probNegStr})</div>;
  } else if (prob === 0.5) {
      return <div>The model doesn't know whether the sentence is <Positive>Positive or Negative</Positive>. (50.0%)</div>;
  } else if (prob < 0.8) {
      return <div>The model thinks the sentence is <Positive>Positive</Positive>. ({probPosStr})</div>;
  } else {
      return <div>The model is are quite sure the sentence is <Positive>Positive</Positive>. ({probPosStr})</div>;
  }
}

// What is rendered as Output when the user hits buttons on the demo.
const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const model = requestData ? requestData.model : undefined;
  const tokens = responseData['tokens'] || requestData['sentence'].split(' ');
  // The RoBERTa-large model is very slow to be attacked
  const attacks = model && model.toLowerCase().includes('roberta') ?
    null
  :
    <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData}/>

  // The "Answer" output field has the models predictions. The other output fields are the
  // reusable HTML/JavaScript for the interpretation methods.
  return (
    <div className="model__content answer">
      <OutputField label="Answer">
        {textFromProbability(responseData['probs'][0])}
      </OutputField>

    <MySaliencyMaps interpretData={interpretData} tokens={tokens} interpretModel={interpretModel} requestData={requestData}/>
    {attacks}
  </div>
  );
}

const Positive = styled.span`
  font-weight: 700;
  color: ${({theme}) => theme.palette.text.success};
`;

const Negative = styled(Positive)`
  color: ${({theme}) => theme.palette.text.error};
`;

// Examples the user can choose from in the demo
const examples = [
  { sentence: "a very well-made, funny and entertaining picture." },
  { sentence: "so unremittingly awful that labeling it a dog probably constitutes cruelty to canines" },
  { sentence: "all the amped up tony hawk style stunts and thrashing rap-metal can't disguise the fact that, really, we've been here, done that."},
  { sentence: "visually imaginative, thematically instructive and thoroughly delightful, it takes us on a roller-coaster ride from innocence to experience without even a hint of that typical kiddie-flick sentimentality."}
]

// A call to a pre-existing model component that handles all of the inputs and outputs. We just need to pass it the things we've already defined as props:
const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, fields, examples, Output, defaultUsage}
export default withRouter(props => <Model {...props} {...modelProps}/>)
