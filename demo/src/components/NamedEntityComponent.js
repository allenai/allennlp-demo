import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneLeft, PaneRight } from './Pane';
import Button from './Button';
import Highlight from './Highlight';
import ModelIntro from './ModelIntro';

// LOC, PER, ORG, MISC

/*******************************************************************************
  <NamedEntityInput/> Component
*******************************************************************************/

const nerSentences = [
  "AllenNLP is a PyTorch-based natural language processing library developed at the Allen Institute for Artificial Intelligence in Seattle.",
  "Did Uriah honestly think he could beat The Legend of Zelda in under three hours?",
  "Michael Jordan is a professor at Berkeley.",
  "My preferred candidate is Cary Moon, but she won't be the next mayor of Seattle.",
  "If you like Paul McCartney you should listen to the first Wings album.",
  "When I told John that I wanted to move to Alaska, he warned me that I'd have trouble finding a Starbucks there."
];

const title = "Named Entity Recognition";
const description = (
  <span>
    <span>
        The named entity recognition model identifies named entities
        (people, locations, organizations, and miscellaneous)
        in the input text. This model is the "baseline" model described in
    </span>
    <a href = "https://www.semanticscholar.org/paper/Semi-supervised-sequence-tagging-with-bidirectiona-Peters-Ammar/73e59cb556351961d1bdd4ab68cbbefc5662a9fc" target="_blank" rel="noopener noreferrer">
      {' '} Peters, Ammar, Bhagavatula, and Power 2017 {' '}
    </a>
    <span>
      .  It uses a Gated Recurrent Unit (GRU) character encoder as well as a GRU phrase encoder,
      and it starts with pretrained
    </span>
    <a href = "https://nlp.stanford.edu/projects/glove/" target="_blank" rel="noopener noreferrer">{' '} GloVe vectors {' '}</a>
    <span>
      for its token embeddings. It was trained on the
    </span>
    <a href = "https://www.clips.uantwerpen.be/conll2003/ner/" target="_blank" rel="noopener noreferrer">{' '} CoNLL-2003 {' '}</a>
    <span>
      NER dataset. It is not state of the art on that task, but it&#39;s not terrible either.
      (This is also the model constructed in our
    </span>
    <a href = "https://github.com/allenai/allennlp/blob/master/tutorials/getting_started/creating_a_model.md" target="_blank" rel="noopener noreferrer">{' '}Creating a Model{' '}</a>
    <span>
      tutorial.)
    </span>
  </span>
);

class NerInput extends React.Component {
  constructor(props) {
    super(props);

    // If we're showing a permalinked result, we'll get passed in a sentence.
    const { sentence } = props;

    this.state = {
      nerSentenceValue: sentence || "",
    };
    this.handleListChange = this.handleListChange.bind(this);
    this.handleSentenceChange = this.handleSentenceChange.bind(this);
  }

  handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
        nerSentenceValue: nerSentences[e.target.value],
      });
    }
  }

  handleSentenceChange(e) {
    this.setState({
      nerSentenceValue: e.target.value,
    });
  }

  render() {
    const { nerSentenceValue } = this.state;
    const { outputState, runNerModel } = this.props;

    const nerInputs = {
      "sentenceValue": nerSentenceValue,
    };

    return (
      <div className="model__content">
        <ModelIntro title={title} description={description} />
        <div className="form__instructions"><span>Enter text or</span>
          <select disabled={outputState === "working"} onChange={this.handleListChange}>
            <option>Choose an example...</option>
            {nerSentences.map((sentence, index) => {
              return (
                <option value={index} key={index}>{sentence}</option>
              );
            })}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="#input--ner-sentence">Sentence</label>
          <input onChange={this.handleSentenceChange} value={nerSentenceValue} id="input--ner-sentence" ref="nerSentence" type="text" required="true" autoFocus="true" placeholder="E.g. &quot;John likes and Bill hates ice cream.&quot;" />
        </div>
        <div className="form__field form__field--btn">
          <Button enabled={outputState !== "working"} outputState={outputState} runModel={runNerModel} inputs={nerInputs} />
        </div>
      </div>
    );
  }
}

/*******************************************************************************
  <TokenSpan /> Component
*******************************************************************************/

class TokenSpan extends React.Component {
  render() {
    const { token } = this.props;

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
      }
    }

    const entity = token.entity;

    if (entity !== null) { // If token has entity value:
      // Display entity text wrapped in a <Highlight /> component.
      return (<Highlight label={entity} color={entityLookup[entity].color} tooltip={entityLookup[entity].tooltip}>{token.text}</Highlight>);
    } else { // If no entity:
      // Display raw text.
      return (<span> {token.text} </span>);
    }
  }
}

/*******************************************************************************
  <NerOutput /> Component
*******************************************************************************/

class NerOutput extends React.Component {
  render() {
    const { words, tags } = this.props;

    // "B" = "Beginning" (first token in a sequence of tokens comprising an entity)
    // "I" = "Inside" (token in a sequence of tokens (that isn't first or last in its sequence) comprising an entity)
    // "L" = "Last" (last token in a sequence of tokens comprising an entity)
    // "O" = "Outside" (token that isn't associated with any entities)
    // "U" = "Unit" (A single token representing a single entity)

    // Defining an empty array for building a list of formatted token objects.
    let formattedTokens = [];
    // Defining an empty string to store temporary span text.
    let spanStr = "";
    // Iterate through array of tags from response data.
    tags.forEach(function (tag, i) {
      // Defining an empty object var to store temporary token data.
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
        <div className="form__field">
          <div className="passage model__content__summary highlight-container--bottom-labels">
            {formattedTokens.map((token, i) => <TokenSpan key={i} token={token} />)}
          </div>
        </div>
      </div>
    )
  }
}

/*******************************************************************************
  <NerComponent /> Component
*******************************************************************************/

class _NerComponent extends React.Component {
  constructor(props) {
    super(props);

    const { requestData, responseData } = props;

    this.state = {
      requestData: requestData,
      responseData: responseData,
      outputState: responseData ? "received" : "empty" // valid values: "working", "empty", "received", "error"
    };

    this.runNerModel = this.runNerModel.bind(this);
  }

  runNerModel(event, inputs) {
    this.setState({outputState: "working"});

    var payload = {sentence: inputs.sentenceValue};

    fetch(`${API_ROOT}/predict/named-entity-recognition`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json();
    }).then((json) => {
      // If the response contains a `slug` for a permalink, we want to redirect
      // to the corresponding path using `history.push`.
      const { slug } = json;
      const newPath = slug ? '/named-entity-recognition/' + slug : '/named-entity-recognition';

      // We'll pass the request and response data along as part of the location object
      // so that the `Demo` component can use them to re-render.
      const location = {
        pathname: newPath,
        state: { requestData: payload, responseData: json }
      }
      this.props.history.push(location);
    }).catch((error) => {
      this.setState({ outputState: "error" });
      console.error(error);
    });
  }

  render() {
    const { requestData, responseData } = this.props;
    const sentence = requestData && requestData.sentence;
    const words = responseData && responseData.words;
    const tags = responseData && responseData.tags;

    return (
      <div className="pane model">
        <PaneLeft>
          <NerInput runNerModel={this.runNerModel}
            outputState={this.state.outputState}
            sentence={sentence} />
        </PaneLeft>
        <PaneRight outputState={this.state.outputState}>
          <NerOutput words={words} tags={tags} />
        </PaneRight>
      </div>
    );
  }
}

const NerComponent = withRouter(_NerComponent);

export default NerComponent;
