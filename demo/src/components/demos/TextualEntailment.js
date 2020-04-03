import React from 'react';
import { ExternalLink } from  '@allenai/varnish/components';
import { withRouter } from 'react-router-dom';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
  } from 'react-accessible-accordion';

import { API_ROOT } from '../../api-config';
import HeatMap from '../HeatMap'
import Model from '../Model'
import OutputField from '../OutputField'
import { UsageSection } from '../UsageSection';
import { UsageHeader } from '../UsageHeader'
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';

import '../../css/TeComponent.css';

import SaliencyMaps from '../Saliency'
import InputReductionComponent from '../InputReduction'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER
} from '../InterpretConstants'

const apiUrl = () => `${API_ROOT}/predict/textual-entailment`
const apiUrlAttack = () => `${API_ROOT}/attack/textual-entailment`
const apiUrlInterpret = () => `${API_ROOT}/interpret/textual-entailment`

const title = "Textual Entailment"

const NAME_OF_INPUT_TO_ATTACK = "hypothesis"
const NAME_OF_GRAD_INPUT = "grad_input_1"

const description = (
  <span>
    <span>
    Textual Entailment (TE) takes a pair of sentences and predicts whether the facts in the first
    necessarily imply the facts in the second one.
    This page demonstrates a reimplementation of
    </span>
    <ExternalLink href = "https://www.semanticscholar.org/paper/A-Decomposable-Attention-Model-for-Natural-Languag-Parikh-T%C3%A4ckstr%C3%B6m/07a9478e87a8304fc3267fa16e83e9f3bbd98b27" target="_blanke" rel="noopener">{' '} the decomposable attention model (Parikh et al, 2017) {' '}</ExternalLink>
    <span>
    , which was state of the art for
    </span>
    <ExternalLink href = "https://nlp.stanford.edu/projects/snli/" target="_blank" rel="noopener">{' '} the SNLI benchmark {' '}</ExternalLink>
    <span>
    (short sentences about visual scenes) in 2016.
    Rather than pre-trained Glove vectors, this model uses <ExternalLink href="https://arxiv.org/abs/1802.05365">ELMo embeddings</ExternalLink>, which are completely character based and improve performance by 2%
    </span>
  </span>
  );

const descriptionEllipsed = (
  <span>
    Textual Entailment (TE) takes a pair of sentences and predicts whether the facts in the first necessarily imply the…
  </span>
)

const fields = [
  {name: "premise", label: "Premise", type: "TEXT_INPUT",
   placeholder: 'E.g. "A large, gray elephant walked beside a herd of zebras."'},
  {name: "hypothesis", label: "Hypothesis", type: "TEXT_INPUT",
   placeholder: 'E.g. "The elephant was lost."'}
]

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
      <Accordion accordion={false}>
        <InputReductionComponent reducedInput={reducedInput} reduceFunction={attackModel(requestData, INPUT_REDUCTION_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
      </Accordion>
    </OutputField>
  )
  // NOTE(mattg): see note above.  This should go right below the input reduction component.
  //<HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
}


const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
  const { label_probs, h2p_attention, p2h_attention, premise_tokens, hypothesis_tokens } = responseData
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
    <OutputField>
      <Accordion accordion={false}>
        <MySaliencyMaps interpretData={interpretData} premise_tokens={premise_tokens} hypothesis_tokens={hypothesis_tokens} interpretModel={interpretModel} requestData={requestData} />
        <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData}/>

        <AccordionItem>
          <AccordionItemTitle>
            Premise to Hypothesis Attention
            <div className="accordion__arrow" role="presentation"/>
          </AccordionItemTitle>
          <AccordionItemBody>
            <p>
                For every premise word, the model computes an attention over the hypothesis words.
                This heatmap shows that attention, which is normalized for every row in the matrix.
            </p>
            <HeatMap colLabels={premise_tokens} rowLabels={hypothesis_tokens} data={h2p_attention} />
          </AccordionItemBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionItemTitle>
            Hypothesis to Premise Attention
            <div className="accordion__arrow" role="presentation"/>
          </AccordionItemTitle>
          <AccordionItemBody>
            <p>
              For every hypothesis word, the model computes an attention over the premise words.
              This heatmap shows that attention, which is normalized for every row in the matrix.
            </p>
            <HeatMap colLabels={hypothesis_tokens} rowLabels={premise_tokens} data={p2h_attention} />
          </AccordionItemBody>
        </AccordionItem>
      </Accordion>
    </OutputField>
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

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"hypothesis": "Two women are sitting on a blanket near some rocks talking about politics.", "premise": "Two women are wandering along the shore drinking iced tea."}' | \\
  allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/decomposable-attention-elmo-2018.02.19.tar.gz -`} />
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/decomposable-attention-elmo-2018.02.19.tar.gz")
predictor.predict(
  hypothesis="Two women are sitting on a blanket near some rocks talking about politics.",
  premise="Two women are wandering along the shore drinking iced tea."
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`allennlp evaluate \\
  https://s3-us-west-2.amazonaws.com/allennlp/models/decomposable-attention-elmo-2018.02.19.tar.gz \\
  https://s3-us-west-2.amazonaws.com/allennlp/datasets/snli/snli_1.0_test.jsonl`} />
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <UsageCode>
        <SyntaxHighlight language="bash">
          allennlp train training_config/decomposable_attention.jsonnet -s output_path
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, descriptionEllipsed, fields, examples, Output, usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
