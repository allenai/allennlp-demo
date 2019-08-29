import React from 'react';
import { withRouter } from 'react-router-dom';
import { ExternalLink } from '@allenai/varnish/components';

import { FormField } from '../Form';
import { API_ROOT } from '../../api-config';
import HighlightContainer from '../highlight/HighlightContainer';
import { Highlight } from '../highlight/Highlight';
import Model from '../Model'
import { truncateText } from '../DemoInput'
import { UsageSection } from '../UsageSection';
import { UsageHeader } from '../UsageHeader';
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';

// LOC, PER, ORG, MISC

const title = "Named Entity Recognition";

const description = (
  <span>
    <span>
        The named entity recognition model identifies named entities
        (people, locations, organizations, and miscellaneous)
        in the input text. This model is the "baseline" model described in
    </span>
    <ExternalLink href = "https://www.semanticscholar.org/paper/Semi-supervised-sequence-tagging-with-bidirectiona-Peters-Ammar/73e59cb556351961d1bdd4ab68cbbefc5662a9fc" target="_blank" rel="noopener">
      {' '} Peters, Ammar, Bhagavatula, and Power 2017 {' '}
    </ExternalLink>
    <span>
      .  It uses a Gated Recurrent Unit (GRU) character encoder as well as a GRU phrase encoder,
      and it starts with pretrained
    </span>
    <ExternalLink href = "https://nlp.stanford.edu/projects/glove/" target="_blank" rel="noopener">{' '} GloVe vectors {' '}</ExternalLink>
    <span>
      for its token embeddings. It was trained on the
    </span>
    <ExternalLink href = "https://www.clips.uantwerpen.be/conll2003/ner/" target="_blank" rel="noopener">{' '} CoNLL-2003 {' '}</ExternalLink>
    <span>
      NER dataset. It is not state of the art on that task, but it&#39;s not terrible either.
      (This is also the model constructed in our
    </span>
    <ExternalLink href = "https://github.com/allenai/allennlp/blob/master/tutorials/getting_started/walk_through_allennlp/creating_a_model.md" target="_blank" rel="noopener">{' '}Creating a Model{' '}</ExternalLink>
    <span>
      tutorial.)
    </span>
  </span>
)

const descriptionEllipsed = (
  <span>
    The named entity recognition model identifies named entities (people, locations, organizations, and…
  </span>
)

const taskModels = [
  {
    name: "elmo-ner",
    desc: "Reimplementation of the NER model described in 'Deep<br/>contextualized word representations' by Peters, et. al."
  },
  {
    name: "fine-grained-ner",
    desc: "This Model identifies a broad range of 16 semantic types in the input text.<br/>This model is a reimplementation of Lample (2016) and uses a biLSTM<br/>with a CRF layer, character embeddings and ELMo embeddings. It was<br/>trained on the Ontonotes 5.0 dataset, and has dev set F1 of 88.2."
  }
]

const taskEndpoints = {
  "elmo-ner": "named-entity-recognition",
  "fine-grained-ner": "fine-grained-named-entity-recognition"
};

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

const Output = ({ responseData }) => {
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

    return (
      <div className="model__content model__content--ner-output">
        <FormField>
          <HighlightContainer layout="bottom-labels">
            {formattedTokens.map((token, i) => <TokenSpan key={i} token={token} />)}
          </HighlightContainer>
        </FormField>
      </div>
    )
}

const examples = [
    "AllenNLP is a PyTorch-based natural language processing library developed at the Allen Institute for Artificial Intelligence in Seattle.",
    "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?",
    "Michael Jordan is a professor at Berkeley.",
    "My preferred candidate is Cary Moon, but she won't be the next mayor of Seattle.",
    "If you like Paul McCartney you should listen to the first Wings album.",
    "When I told John that I wanted to move to Alaska, he warned me that I'd have trouble finding a Starbucks there."
  ].map(sentence => ({sentence, snippet: truncateText(sentence)}))

const apiUrl = ({model}) => {
    const selectedModel = model || (taskModels[0] && taskModels[0].name);
    const endpoint = taskEndpoints[selectedModel]
    return `${API_ROOT}/predict/${endpoint}`
}

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"sentence": "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"}' | \\
allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/ner-model-2018.12.18.tar.gz -`}
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/ner-model-2018.12.18.tar.gz")
predictor.predict(
  sentence="Did Uriah honestly think he could beat The Legend of Zelda in under three hours?"
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <p>
        The NER model was evaluated on the <a href="https://www.clips.uantwerpen.be/conll2003/ner/">CoNLL-2003</a> NER
        dataset. Unfortunately we cannot release this data due to licensing restrictions.
      </p>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <p>
        The NER model was trained on the <a href="https://www.clips.uantwerpen.be/conll2003/ner/">CoNLL-2003</a> NER dataset. Unfortunately we cannot release this data due to licensing restrictions.
      </p>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output, usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
