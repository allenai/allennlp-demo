import React from 'react';
import { withRouter } from 'react-router-dom';
import { Collapse } from '@allenai/varnish';

import HighlightContainer from '../highlight/HighlightContainer';
import { Highlight } from '../highlight/Highlight';
import Model from '../Model'
import OutputField from '../OutputField'
import { truncateText } from '../DemoInput'
import SaliencyMaps from '../Saliency'
import InputReductionComponent, { InputReductionPanel } from '../InputReduction'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER
} from '../InterpretConstants'

// LOC, PER, ORG, MISC
const title = "Named Entity Recognition";

const NAME_OF_INPUT_TO_ATTACK = 'tokens'
const NAME_OF_GRAD_INPUT = 'grad_input_1'

const description = (
  <span>
    <span>
        Named Entity Recognition is the task of identifying named entities
        (people, locations, organizations, etc.)
        in the input text.
    </span>
  </span>
)

const defaultUsage = undefined

const bashCommand = (modelUrl) => {
  return `echo '{"sentence": "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"}' | \\
allennlp predict ${modelUrl} -`
}

const pythonCommand = (modelUrl) => {
  return `from allennlp.predictors.predictor import Predictor
import allennlp_models.tagging
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  sentence="Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"
)`
}

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const buildUsage = (modelFile) => {
  const fullModelUrl = `https://storage.googleapis.com/allennlp-public-models/${modelFile}`;
  return {
    installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
    bashCommand: bashCommand(fullModelUrl),
    pythonCommand: pythonCommand(fullModelUrl),
    evaluationNote: (<span>
      The NER model was evaluated on the <a href="https://www.clips.uantwerpen.be/conll2003/ner/">CoNLL-2003</a> NER
      dataset. Unfortunately we cannot release this data due to licensing restrictions.
    </span>),
    trainingNote: (<span>
      The NER model was trained on the <a href="https://www.clips.uantwerpen.be/conll2003/ner/">CoNLL-2003</a> NER
      dataset. Unfortunately we cannot release this data due to licensing restrictions.
    </span>)
  }
}

const taskModels = [
  {
    name: "elmo-ner",
    desc: <span>
      This model is the baseline model described
      in <a href = "https://www.semanticscholar.org/paper/Semi-supervised-sequence-tagging-with-bidirectiona-Peters-Ammar/73e59cb556351961d1bdd4ab68cbbefc5662a9fc">
      Peters, Ammar, Bhagavatula, and Power 2017</a>.
      It uses a Gated Recurrent Unit (GRU) character encoder as well as a GRU phrase encoder,
      and it starts with pretrained <a href = "https://nlp.stanford.edu/projects/glove/">GloVe vectors</a> for
      its token embeddings. It was trained on the <a href = "https://www.clips.uantwerpen.be/conll2003/ner/">CoNLL-2003</a> NER dataset.
      </span>,
    modelId: "named-entity-recognition",
    usage: buildUsage("ner-model-2020.02.10.tar.gz")
  },
  {
    name: "fine-grained-ner",
    desc: <span>
      This Model identifies a broad range of 16 semantic types in the input text. This model is a
      reimplementation of <a href="https://arxiv.org/abs/1603.01360">Lample (2016)</a> and uses a biLSTM with a CRF layer, character embeddings
      and ELMo embeddings. It was trained on the Ontonotes 5.0 dataset, and has dev set F1 of 88.2.
      </span>,
    modelId: "fine-grained-ner",
    usage: buildUsage("fine-grained-ner.2020-06-24.tar.gz")
  }
]

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "John likes and Bill hates ice cream."`},
    {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: true}
]

const TokenSpan = ({ token }) => {
    // Lookup table for entity style values:
    const entityLookup = {
      "PER": {
        tooltip: "Person",
        color: "pink"
      },
      "LOC": {
        tooltip: "Location",
        color: "green"
      },
      "ORG": {
        tooltip: "Organization",
        color: "blue"
      },
      "MISC": {
        tooltip: "Miscellaneous",
        color: "gray"
      },
      "PERSON": {
        tooltip: "Person",
        color: "pink"
      },
      "CARDINAL": {
        tooltip: "Cardinal Number",
        color: "orange"
      },
      "EVENT": {
        tooltip: "Event",
        color: "green"
      },
      "DATE": {
        tooltip: "Date",
        color: "fuchsia"
      },
      "FAC": {
        tooltip: "Facility",
        color: "cobalt"
      },
      "GPE": {
        tooltip: "Country/City/State",
        color: "teal"
      },
      "LANGUAGE": {
        tooltip: "Language",
        color: "red"
      },
      "LAW": {
        tooltip: "Law",
        color: "brown"
      },
      // LOC - see above
      "MONEY": {
        tooltip: "Monetary Value",
        color: "orange"
      },
      "NORP": {
        tooltip: "Nationalities, Religious/Political Groups",
        color: "green"
      },
      "ORDINAL": {
        tooltip: "Ordinal Value",
        color: "orange"
      },
      // ORG - see above.
      "PERCENT": {
        tooltip: "Percentage",
        color: "orange"
      },
      "PRODUCT": {
        tooltip: "Product",
        color: "purple"
      },
      "QUANTITY": {
        tooltip: "Quantity",
        color: "orange"
      },
      "TIME": {
        tooltip: "Time",
        color: "fuchsia"
      },
      "WORK_OF_ART": {
        tooltip: "Work of Art/Media",
        color: "tan"
      },
    }

    const entity = token.entity;

    if (entity !== null) { // If token has entity value:
      // Display entity text wrapped in a <Highlight /> component.
      return (<Highlight label={entity} color={entityLookup[entity].color} tooltip={entityLookup[entity].tooltip}>{token.text} </Highlight>);
    } else { // If no entity:
      // Display raw text.
      return (<span>{token.text} </span>);
    }
}

const getGradData = (instances, numGrads) => {
  const grads = [];
  for (let i = 1; i <= numGrads; i++) {
      grads.push(instances['instance_' + i.toString()].grad_input_1)
  }
  return grads;
}

const MySaliencyMaps = ({interpretData, tokens, relevantTokens, interpretModel, requestData}) => {
  let simpleGradData = undefined;
  let integratedGradData = undefined;
  let smoothGradData = undefined;
  if (interpretData) {
    const numGrads = relevantTokens.length;
    simpleGradData = GRAD_INTERPRETER in interpretData ? getGradData(interpretData[GRAD_INTERPRETER], numGrads) : undefined
    integratedGradData = IG_INTERPRETER in interpretData ? getGradData(interpretData[IG_INTERPRETER], numGrads) : undefined
    smoothGradData = SG_INTERPRETER in interpretData ? getGradData(interpretData[SG_INTERPRETER], numGrads) : undefined
  }
  const inputTokens = [];
  const inputHeaders = [];
  relevantTokens.forEach((token, index) => {
    inputTokens.push(tokens);
    inputHeaders.push(
        <div key={index} style={{ display: "flex", flexWrap: "wrap" }}>
          <p><strong>Interpretation for</strong></p>
          <TokenSpan key={index} token={token} />
        </div>
    );
  });
  const allInterpretData = {simple: simpleGradData, ig: integratedGradData, sg: smoothGradData};
  return <SaliencyMaps interpretData={allInterpretData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} />
}

const Attacks = ({attackData, attackModel, requestData, relevantTokens}) => {
  let reducedInput = undefined;
  if (attackData && "input_reduction" in attackData) {
    const reductionData = attackData["input_reduction"];
    const formattedReduced = reductionData["final"].map((reduced, index) =>
      <p key={index} style={{ display: "flex", flexWrap: "wrap" }}>
        <strong>Reduced input for</strong>
        <TokenSpan key={index} token={relevantTokens[index]} />
        <strong>:</strong> <span>&nbsp;&nbsp;&nbsp;&nbsp;</span> {reduced.join(" ")}
        <br />
      </p>
    );
    reducedInput = {original: reductionData["original"].join(" "), formattedReduced: formattedReduced}
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
}

const Output = ({ responseData, requestData, interpretData, interpretModel, attackData, attackModel}) => {
    const { words, tags } = responseData

    // "B" = "Beginning" (first token in a sequence of tokens comprising an entity)
    // "I" = "Inside" (token in a sequence of tokens (that isn't first or last in its sequence) comprising an entity)
    // "L" = "Last" (last token in a sequence of tokens comprising an entity)
    // "O" = "Outside" (token that isn't associated with any entities)
    // "U" = "Unit" (A single token representing a single entity)

    // Defining an empty array for building a list of formatted token objects.
    let formattedTokens = [];
    // Defining an empty string to store temporary span text (this field is used to build up the entire text in a single BIL span).
    let spanStr = "";
    // Iterate through array of tags from response data.
    tags.forEach(function (tag, i) {
      // Defining an empty object to store temporary token data.
      let tokenObj = {};
      if (tag === "O") { // If this tag is not part of an entity:
        // Build token object using this token's word and set entity to null.
        tokenObj = {
          text: words[i],
          entity: null
        }
        // Append array of formatted token objects with this token object.
        formattedTokens.push(tokenObj);
      } else if (tag[0] === "U") { // If this tag is a unit token:
        // Build token object using this token's word and entity.
        tokenObj = {
          text: words[i],
          entity: tag.slice(2) // tag value with "U-" stripped from the beginning
        }
        // Append array of formatted token objects with this token object.
        formattedTokens.push(tokenObj);
      } else if (tag[0] === "B") { // If this tag is beginning of a span:
        // Reset span string to current token's word.
        spanStr = `${words[i]}`;
      } else if (tag[0] === "I") { // If this tag is inside a span:
        // Append current word to span string w/ space at beginning.
        spanStr += ` ${words[i]} `;
      } else if (tag[0] === "L") { // If this tag is last in a span:
        // Append current word to span string w/ space at beginning.
        spanStr += ` ${words[i]}`;
        // Build token object using final span string and entity tag for this token.
        tokenObj = {
          text: spanStr,
          entity: tag.slice(2) // tag value with "L-" stripped from the beginning
        }
        // Append array of formatted token objects with this token object.
        formattedTokens.push(tokenObj);
      }
    });

    let relevantTokens = []
    formattedTokens.forEach(token => {
      if (token.entity !== null) {
        relevantTokens.push(token)
      }
    })

    return (
      <div className="model__content model__content--ner-output">
        <OutputField>
          <HighlightContainer layout="bottom-labels">
            {formattedTokens.map((token, i) => <TokenSpan key={i} token={token} />)}
          </HighlightContainer>
        </OutputField>
        <MySaliencyMaps interpretData={interpretData} tokens={words} relevantTokens={relevantTokens} interpretModel={interpretModel} requestData={requestData}/>
        <Attacks attackData={attackData} attackModel={attackModel} requestData={requestData} relevantTokens={relevantTokens}/>
      </div>
    )
}

const examples = [
    "This shirt was bought at Grandpa Joe's in downtown Deep Learning.",
    "AllenNLP is a PyTorch-based natural language processing library developed at the Allen Institute for Artificial Intelligence in Seattle.",
    "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?",
    "Michael Jordan is a professor at Berkeley.",
    "My preferred candidate is Cary Moon, but she won't be the next mayor of Seattle.",
    "If you like Paul McCartney you should listen to the first Wings album.",
    "When I told John that I wanted to move to Alaska, he warned me that I'd have trouble finding a Starbucks there."
  ].map(sentence => ({sentence, snippet: truncateText(sentence)}))

const getUrl = (model, ...paths) => {
  const selectedModel = taskModels.find(t => t.name === model)
    || taskModels.find(t => t.modelId === model)
    || taskModels[0];
  return `/${['api', selectedModel.modelId, ...paths ].join('/')}`;
}

const apiUrl = ({model}) => {
  return getUrl(model, "predict")
}

const apiUrlInterpret = ({model}, interpreter) => {
  return getUrl(model, "interpret", interpreter)
}

const apiUrlAttack = ({model}, attacker) => {
  return getUrl(model, "attack", attacker)
}

export default withRouter(props => <Model {...props} {...modelProps}/>)
const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, fields, examples, Output, defaultUsage}
