import React from 'react';
import { withRouter } from 'react-router-dom';
import { Collapse } from '@allenai/varnish';

import HeatMap from '../HeatMap'
import Model from '../Model'
import OutputField from '../OutputField'
import SaliencyMaps from '../Saliency'
import InputReductionComponent, { InputReductionPanel } from '../InputReduction'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER
} from '../InterpretConstants'

import '../../css/TeComponent.css';

const title = "Textual Entailment"

const NAME_OF_INPUT_TO_ATTACK = "hypothesis"
const NAME_OF_GRAD_INPUT = "grad_input_1"

const description = (
  <span>
    Textual Entailment (TE) is the task of predicting whether, for a pair of sentences, the facts in the first sentence necessarily imply the facts in the second.
    This task is in some sense "NLP-complete", and you should not expect any current model to cover every possible aspect of entailment.  Instead, you should think about what the model was trained on to see whether it could reasonably capture the phenomena that you are querying it with.
  </span>
  );

const defaultUsage = undefined

const bashCommand = (modelUrl) => {
  return `echo '{"hypothesis": "Two women are sitting on a blanket near some rocks talking about politics.", "premise": "Two women are wandering along the shore drinking iced tea."}' | \\
allennlp predict --predictor textual_entailment ${modelUrl} -`
}

const pythonCommand = (modelUrl) => {
  return `from allennlp.predictors.predictor import Predictor
import allennlp_models.pair_classification
predictor = Predictor.from_path("${modelUrl}", "textual_entailment")
predictor.predict(
  hypothesis="Two women are sitting on a blanket near some rocks talking about politics.",
  premise="Two women are wandering along the shore drinking iced tea."
)`
}

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const buildUsage = (modelFile, configFile) => {
  const fullModelUrl = `https://storage.googleapis.com/allennlp-public-models/${modelFile}`;
  const fullConfigUrl = `https://raw.githubusercontent.com/allenai/allennlp-models/v1.0.0/training_config/pair_classification/${configFile}`;
  return {
    installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
    bashCommand: bashCommand(fullModelUrl),
    pythonCommand: pythonCommand(fullModelUrl),
    evaluationCommand: `allennlp evaluate \\
    ${fullModelUrl} \\
    https://s3-us-west-2.amazonaws.com/allennlp/datasets/snli/snli_1.0_test.jsonl`,
    trainingCommand: `allennlp train ${fullConfigUrl} -s output_path`
  }
}

const taskModels = [
  {
    name: "Decomposable Attention + ELMo; SNLI",
    desc: <span>The <a href = "https://www.semanticscholar.org/paper/A-Decomposable-Attention-Model-for-Natural-Languag-Parikh-T%C3%A4ckstr%C3%B6m/07a9478e87a8304fc3267fa16e83e9f3bbd98b27">decomposable attention model (Parikh et al, 2017)</a> combined with  <a href="https://arxiv.org/abs/1802.05365">ELMo embeddings</a> trained on SNLI.</span>,
    modelId: "elmo-snli",
    usage: buildUsage("decomposable-attention-elmo-2020.04.09.tar.gz", "decomposable_attention_elmo.jsonnet")
  },
  {
    name: "RoBERTa; SNLI",
    desc: <span>The <a href="https://www.semanticscholar.org/paper/RoBERTa%3A-A-Robustly-Optimized-BERT-Pretraining-Liu-Ott/077f8329a7b6fa3b7c877a57b81eb6c18b5f87de">RoBERTa model (Liu et al, 2019)</a> trained on SNLI.<p><b>Contributed by:</b> <a href = "https://zhaofengwu.github.io" target="_blank" rel="noopener noreferrer">Zhaofeng Wu</a></p></span>,
    modelId: "roberta-snli",
    usage: buildUsage("snli_roberta-2020.06.09.tar.gz", "snli_roberta.jsonnet")
  },
  {
    name: "RoBERTa; MultiNLI",
    desc: <span>The <a href="https://www.semanticscholar.org/paper/RoBERTa%3A-A-Robustly-Optimized-BERT-Pretraining-Liu-Ott/077f8329a7b6fa3b7c877a57b81eb6c18b5f87de">RoBERTa model (Liu et al, 2019)</a> trained on <a href="https://www.nyu.edu/projects/bowman/multinli/paper.pdf">MultiNLI</a>.<p><b>Contributed by:</b> <a href = "https://zhaofengwu.github.io" target="_blank" rel="noopener noreferrer">Zhaofeng Wu</a></p></span>,
    modelId: "roberta-mnli",
    usage: buildUsage("mnli_roberta-2020.06.09.tar.gz", "mnli_roberta.jsonnet")
  }
]

const fields = [
  {name: "premise", label: "Premise", type: "TEXT_INPUT",
   placeholder: 'E.g. "A large, gray elephant walked beside a herd of zebras."'},
  {name: "hypothesis", label: "Hypothesis", type: "TEXT_INPUT",
   placeholder: 'E.g. "The elephant was lost."'},
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

const TeGraph = ({x, y}) => {
  const width = 224;
  const height = 194;

  const absoluteX = Math.round(x * width);
  const absoluteY = Math.round((1.0 - y) * height);

  const plotCoords = {
    left: `${absoluteX}px`,
    top: `${absoluteY}px`,
  };

  return (
    <div className="te-graph-labels">
    <div className="te-graph">
      <div className="te-graph__point" style={plotCoords}></div>
    </div>
    </div>
  )
}

const judgments = {
  CONTRADICTION: <span>the premise <strong>contradicts</strong> the hypothesis</span>,
  ENTAILMENT: <span>the premise <strong>entails</strong> the hypothesis</span>,
  NEUTRAL: <span>there is <strong>no correlation</strong> between the premise and hypothesis</span>
}

const getGradData = ({ grad_input_1, grad_input_2 }) => {
  // Not sure why, but it appears that the order of the gradients is reversed for these.
  return [grad_input_2, grad_input_1];
}

const MySaliencyMaps = ({interpretData, premise_tokens, hypothesis_tokens, interpretModel, requestData}) => {
  let simpleGradData = undefined;
  let integratedGradData = undefined;
  let smoothGradData = undefined;
  if (interpretData) {
    simpleGradData = GRAD_INTERPRETER in interpretData ? getGradData(interpretData[GRAD_INTERPRETER]['instance_1']) : undefined
    integratedGradData = IG_INTERPRETER in interpretData ? getGradData(interpretData[IG_INTERPRETER]['instance_1']) : undefined
    smoothGradData = SG_INTERPRETER in interpretData ? getGradData(interpretData[SG_INTERPRETER]['instance_1']) : undefined
  }
  const inputTokens = [premise_tokens, hypothesis_tokens];
  const inputHeaders = [<p><strong>Premise:</strong></p>, <p><strong>Hypothesis:</strong></p>];
  const allInterpretData = {simple: simpleGradData, ig: integratedGradData, sg: smoothGradData};
  return <SaliencyMaps interpretData={allInterpretData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} />
}

const Attacks = ({attackData, attackModel, requestData}) => {
  /*
   * NOTE(mattg): Hotflip doesn't work with the default SNLI model, which uses only EMLo as input
   * and thus doesn't have a vocabulary to use for hotflip.  So I'm temporarily disabling this.  I
   * don't want to remove the code, though, because whenever we update the SNLI model to use
   * RoBERTa or whatever we'll want to add this back.
  let hotflipData = undefined;
  if (attackData && "hotflip" in attackData) {
    hotflipData = attackData["hotflip"];
    const [entail, contr, neutral] = hotflipData["outputs"]["label_probs"]
    let prediction = '';
    if (entail > contr) {
        if (entail > neutral) {
            prediction = "Entailment"
        } else {
            prediction = "Neutral"
        }
    } else {
        if (contr > neutral) {
            prediction = "Contradiction"
        } else {
            prediction = "Neutral"
        }
    }
    hotflipData["new_prediction"] = prediction;
    hotflipData["context"] = <p><strong>Premise:</strong> {requestData['premise']}</p>
  }
  */
  let reducedInput = undefined;
  if (attackData && "input_reduction" in attackData) {
    const reductionData = attackData["input_reduction"];
    reducedInput = {
      original: reductionData["original"],
      context: <p><strong>Premise:</strong> {requestData['premise']}</p>,
      reduced: [reductionData["final"][0]]
    };
  }
  return (
    <OutputField label="Model Attacks">
      <Collapse>
        <InputReductionPanel>
          <InputReductionComponent reducedInput={reducedInput} reduceFunction={attackModel(requestData, INPUT_REDUCTION_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        </InputReductionPanel>
      </Collapse>
    </OutputField>
  )
  // NOTE(mattg): see note above.  This should go right below the input reduction component.
  // <HotflipPanel>
  //   <HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
  // </HotflipPanel>
}


const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const model = requestData ? requestData.model : undefined;

  let label_probs, h2p_attention, p2h_attention, premise_tokens, hypothesis_tokens;
  const modelIsRoberta = model && model.toLowerCase().includes('roberta');
  if (modelIsRoberta) {
    label_probs = responseData.probs
  } else {
    label_probs = responseData.label_probs
    h2p_attention = responseData.h2p_attention
    p2h_attention = responseData.p2h_attention
    premise_tokens = responseData.premise_tokens
    hypothesis_tokens = responseData.hypothesis_tokens
  }
  const [entailment, contradiction, neutral] = label_probs

  // Find judgment and confidence.
  let judgment
  let confidence

  if (entailment > contradiction && entailment > neutral) {
    judgment = judgments.ENTAILMENT
    confidence = entailment
  }
  else if (contradiction > entailment && contradiction > neutral) {
    judgment = judgments.CONTRADICTION
    confidence = contradiction
  }
  else if (neutral > entailment && neutral > contradiction) {
    judgment = judgments.NEUTRAL
    confidence = neutral
  } else {
    throw new Error("cannot form judgment")
  }

  // Create summary text.
  const veryConfident = 0.75;
  const somewhatConfident = 0.50;
  let summaryText

  if (confidence >= veryConfident) {
    summaryText = (
      <div>
        It is <strong>very likely</strong> that {judgment}.
      </div>
    )
  } else if (confidence >= somewhatConfident) {
    summaryText = (
      <div>
        It is <strong>somewhat likely</strong> that {judgment}.
      </div>
    )
  } else {
    summaryText = (
      <div>The model is not confident in its judgment.</div>
      )
  }

  function formatProb(n) {
  return parseFloat((n * 100).toFixed(1)) + "%";
  }

  // https://en.wikipedia.org/wiki/Ternary_plot#Plotting_a_ternary_plot
  const a = contradiction;
  const b = neutral;
  const c = entailment;
  const x = 0.5 * (2 * b + c) / (a + b + c)
  const y = (c / (a + b + c))

  // The RoBERTa-large models don't support interprets
  const accordion = modelIsRoberta ?
    null
  :
    <>
      <MySaliencyMaps interpretData={interpretData} premise_tokens={premise_tokens} hypothesis_tokens={hypothesis_tokens} interpretModel={interpretModel} requestData={requestData} />
      <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData}/>
      <OutputField label="Attention">
        <Collapse>
          <Collapse.Panel header="Premise to Hypothesis Attention">
            <p>
                For every premise word, the model computes an attention over the hypothesis words.
                This heatmap shows that attention, which is normalized for every row in the matrix.
            </p>
            <HeatMap colLabels={premise_tokens} rowLabels={hypothesis_tokens} data={h2p_attention} />
          </Collapse.Panel>
          <Collapse.Panel header="Hypothesis to Premise Attention">
            <p>
              For every hypothesis word, the model computes an attention over the premise words.
              This heatmap shows that attention, which is normalized for every row in the matrix.
            </p>
            <HeatMap colLabels={hypothesis_tokens} rowLabels={premise_tokens} data={p2h_attention} />
          </Collapse.Panel>
        </Collapse>
      </OutputField>
    </>

  return (
  <div className="model__content answer">
    <OutputField label="Summary">
    {summaryText}
    </OutputField>
    <div className="te-output">
    <TeGraph x={x} y={y}/>
    <div className="te-table">
      <table>
      <thead>
        <tr>
        <th>Judgment</th>
        <th>Probability</th>
        </tr>
      </thead>
      <tbody>
        <tr>
        <td>Entailment</td>
        <td>{formatProb(entailment)}</td>
        </tr>
        <tr>
        <td>Contradiction</td>
        <td>{formatProb(contradiction)}</td>
        </tr>
        <tr>
        <td>Neutral</td>
        <td>{formatProb(neutral)}</td>
        </tr>
      </tbody>
      </table>
    </div>
    </div>
    {accordion}
  </div>
  );
}

const examples = [
  {
    premise: "If you help the needy, God will reward you.",
    hypothesis: "Giving money to the poor has good consequences.",
  },
  {
    premise: "Two women are wandering along the shore drinking iced tea.",
    hypothesis: "Two women are sitting on a blanket near some rocks talking about politics.",
  },
  {
    premise: "An interplanetary spacecraft is in orbit around a gas giant's icy moon.",
    hypothesis: "The spacecraft has the ability to travel between planets.",
  },
  {
    premise: "A large, gray elephant walked beside a herd of zebras.",
    hypothesis: "The elephant was lost.",
  },
  {
    premise: "A handmade djembe was on display at the Smithsonian.",
    hypothesis: "Visitors could see the djembe.",
  },
]

const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
