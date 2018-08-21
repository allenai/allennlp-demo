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
      NER dataset. It is not state of the art on that task, but it's not terrible either.
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
  <NerOutput /> Component
*******************************************************************************/

const tagDescriptions = {
  'PER': 'Person',
  'LOC': 'Location',
  'ORG': 'Organization',
  'MISC': 'Miscellaneous'
}

// const entityLookup = {
//   "PER": {
//     tooltip: "Person",
//     color: "pink"
//   },
//   "LOC": {
//     tooltip: "Location",
//     color: "green"
//   },
//   "ORG": {
//     tooltip: "Organization",
//     color: "blue"
//   },
//   "MISC": {
//     tooltip: "Miscellaneous",
//     color: "gray"
//   }
// }

// Render the NER tag for a single word as a table cell
class NerTagCell extends React.Component {

  render() {
    const { tag, colorClass, colSpan } = this.props;

    // Don't show "O" tags, and slice off all the "B-" and "I-" prefixes.
    const tagText = tag === "O" ? "" : tag.slice(2);

    // Use the tag description as the tooltip.
    const description = tagDescriptions[tagText] || null;

    return (
      <td data-tooltip={description} colSpan={colSpan} className={colorClass + ' ner-tag ner-tag-' + tagText.toLowerCase()}>
        {tagText}
      </td>
    )
  }
}

// Render a NER-tagged word as a table cell
class NerWordCell extends React.Component {
  render() {
    const { word, colorClass } = this.props;

    return (<td className={colorClass + ' ner-word'}>{word}</td>)
  }
}

class TokenSpan extends React.Component {
  render() {
    const { token } = this.props;

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

    if (entity !== null) {
      // If token has entity value then highlight the span
      return (<Highlight label={entity} color={entityLookup[entity].color} tooltip={entityLookup[entity].tooltip}>{token.text}</Highlight>);
    } else {
      // If no entity, just show raw text
      return (<span> {token.text} </span>);
    }
  }
}



class NerOutput extends React.Component {
  render() {
    const { words, tags } = this.props;

    // Create an array indicating what color to highlight each tag cell.
    // For "O" tags this should be -1, indicating no color.
    // Otherwise it should toggle between 0 and 1 every time a "B-" tag occurs.
    var colorClasses = [];
    var currentColor = 1;

    // We want to merge consecutive identical tags and use `colspan=n`.
    // In order to do that, we create a dictionary from starting indexes to span lengths.
    let spanLengths = {};
    let lastSpanStart;



    // "B-" = "Beginning" (first token in a contiguous list of tokens representing a single entity)
    // "I-" = "Inside" (token in a contiguous list of tokens (that isn't first or last) representing a single entity)
    // "L-" = "Last" (last token in a contiguous list of tokens representing a single entity)
    // "O-" = "Outside" (token that isn't associated with an entity)
    // "U-" = "Unit" (A single token representing a single entity)


    tags.forEach(function (tag, i) {
      if (tag === "O") {
        // "O" = "Outside" (tokens that aren't part of a named entity span)
        // "O" tag, so append "" for "no color"
        colorClasses.push("");

        // Add a span with length 1 and close it.
        spanLengths[i] = 1;
        lastSpanStart = undefined;
      } else if (tag[0] === "B") {
        // "B" = "Beginning" (first token in a contiguous list of tokens representing a single entity)
        // "B-" tag, so toggle the current color and then append
        currentColor = (currentColor + 1) % 2;
        colorClasses.push("color" + currentColor);

        // Add a span with length 1, but don't "close it"
        lastSpanStart = i;
        spanLengths[i] = 1;
      } else if (tag[0] === "U") {
        // "U" = "Unit" (A single token representing a single entity)
        // Single length span
        currentColor = (currentColor + 1) % 2;
        colorClasses.push("color" + currentColor);

        // Add a span with length 1 and close it.
        spanLengths[i] = 1;
        lastSpanStart = undefined;
      } else /* (tag[0] == "L") */ {
        // "L" = "Last" (last token in a contiguous list of tokens representing a single entity)
        // "L-" tag, so append the current color
        colorClasses.push("color" + currentColor);

        // Extend the length of the currently open span.
        spanLengths[lastSpanStart] = spanLengths[lastSpanStart] + 1;
      }
    });

    const formattedTokens = [
      {
        text: "AllenNLP",
        entity: "ORG"
      },
      {
        text: "is",
        entity: null
      },
      {
        text: "a",
        entity: null
      },
      {
        text: "PyTorch",
        entity: "ORG"
      },
      {
        text: "-",
        entity: null
      },
      {
        text: "based",
        entity: null
      },
      {
        text: "natural",
        entity: null
      },
      {
        text: "language",
        entity: null
      },
      {
        text: "processing",
        entity: null
      },
      {
        text: "library",
        entity: null
      },
      {
        text: "developed",
        entity: null
      },
      {
        text: "at",
        entity: null
      },
      {
        text: "the",
        entity: null
      },
      {
        text: "Allen Institute for Artificial Intelligence",
        entity: "ORG"
      },
      {
        text: "in",
        entity: null
      },
      {
        text: "Seattle",
        entity: "LOC"
      },
      {
        text: ".",
        entity: null
      },
    ];

    return (
      <div className="model__content model__content--ner-output">
        <div className="form__field">
          <div className="passage model__content__summary highlight-container--bottom-labels">
            {formattedTokens.map((token, i) => <TokenSpan key={i} token={token} />)}
          </div>
        </div>

        <div className="form__field">
          <table className="ner-table">
            <tbody>
              <tr>
                {
                  tags.map((tag, i) => {
                    const colSpan = spanLengths[i];
                    if (colSpan) {
                      return <NerTagCell tag={tag} key={i} colSpan={colSpan} colorClass={colorClasses[i]} />
                    } else {
                      return null;
                    }
                  })
                }
              </tr>
              <tr>
                {words.map((word, i) => <NerWordCell word={word} key={i} colorClass={colorClasses[i]} />)}
              </tr>
            </tbody>
          </table>
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

    // if (responseData !== null) {
    //   console.log("number of tokens:");
    //   console.log(words.length);
    //   console.log("---------------------");
    //   console.log("words:");
    //   console.log(words);
    //   console.log("---------------------");
    //   console.log("tags:");
    //   console.log(tags);
    //   console.log("---------------------");
    // }

    const hcTags = ["U-ORG", "O", "O", "U-ORG", "O", "O", "O", "O", "O", "O", "O", "O", "O", "B-ORG", "I-ORG", "I-ORG", "I-ORG", "L-ORG", "O", "U-LOC", "O"];

    const hcWords = ["AllenNLP", "is", "a", "PyTorch", "-", "based", "natural", "language", "processing", "library", "developed", "at", "the", "Allen", "Institute", "for", "Artificial", "Intelligence", "in", "Seattle", "."];

    const formattedTokens = [
      {
        text: "AllenNLP",
        entity: "ORG"
      },
      {
        text: "is",
        entity: null
      },
      {
        text: "a",
        entity: null
      },
      {
        text: "PyTorch",
        entity: "ORG"
      },
      {
        text: "-",
        entity: null
      },
      {
        text: "based",
        entity: null
      },
      {
        text: "natural",
        entity: null
      },
      {
        text: "language",
        entity: null
      },
      {
        text: "processing",
        entity: null
      },
      {
        text: "library",
        entity: null
      },
      {
        text: "developed",
        entity: null
      },
      {
        text: "at",
        entity: null
      },
      {
        text: "the",
        entity: null
      },
      {
        text: "Allen Institute for Artificial Intelligence",
        entity: "ORG"
      },
      {
        text: "in",
        entity: null
      },
      {
        text: "Seattle",
        entity: "LOC"
      },
      {
        text: ".",
        entity: null
      },
    ];

    let dynamicTokens = [];

    // tags.forEach(function (tag, i) {
    //   if (tag === "O") {
    //     // "O" = "Outside"
    //     colorClasses.push("");
    //     spanLengths[i] = 1;
    //     lastSpanStart = undefined;
    //   } else if (tag[0] === "B") {
    //     // "B" = "Beginning"
    //     currentColor = (currentColor + 1) % 2;
    //     colorClasses.push("color" + currentColor);
    //     // Add a span with length 1, but don't "close it"
    //     lastSpanStart = i;
    //     spanLengths[i] = 1;
    //   } else if (tag[0] === "U") {
    //     // "U" = "Unit"
    //     currentColor = (currentColor + 1) % 2;
    //     colorClasses.push("color" + currentColor);
    //     spanLengths[i] = 1;
    //     lastSpanStart = undefined;
    //   } else /* (tag[0] == "L") */ {
    //     // "L" = "Last" (last token in a contiguous list of tokens representing a single entity)
    //     colorClasses.push("color" + currentColor);
    //     spanLengths[lastSpanStart] = spanLengths[lastSpanStart] + 1;
    //   }
    // });

    // "B" = "Beginning" (first token in a sequence of tokens comprising an entity)
    // "I" = "Inside" (token in a sequence of tokens (that isn't first or last in its sequence) comprising an entity)
    // "L" = "Last" (last token in a sequence of tokens comprising an entity)
    // "O" = "Outside" (token that isn't associated with any entities)
    // "U" = "Unit" (A single token representing a single entity)
    let spanGroup = "";
    hcTags.forEach(function (tag, i) {
      let tokenObj = {};
      if (tag === "O") {
        tokenObj = {
          text: hcWords[i],
          entity: null
        }
        dynamicTokens.push(tokenObj);
      } else if (tag[0] === "U") {
        tokenObj = {
          text: hcWords[i],
          entity: tag.slice(2)
        }
        dynamicTokens.push(tokenObj);
      } else if (tag[0] === "B") {
        spanGroup = `${hcWords[i]} `;
      } else if (tag[0] === "I") {
        spanGroup += `${hcWords[i]} `;
      } else if (tag[0] === "L") {
        spanGroup += `${hcWords[i]}`;
        tokenObj = {
          text: spanGroup,
          entity: tag.slice(2)
        }
        dynamicTokens.push(tokenObj);
      }
        // const truncatedTags = hcWords.slice(i + 1, hcWords.length);
        // let index = 0;
        // while (index < truncatedTags.length) {
        //   spanGroup = `${spanGroup} ${truncatedTags[index]}`;
        //   index++;
        //
        //   // if (breakCondition) {
        //   //   break;
        //   // }
        // }
        // tokenObj = {
        //   text: spanGroup,
        //   entity: tag.slice(2)
        // }

      // else if (tag[0] === "I") {
      //   spanGroup = `${spanGroup} ${tag[i]}`;
      // } else /* if (tag[0] === "L") */ {
      //   spanGroup = `${spanGroup} ${tag[i]}`;
      //   tokenObj = {
      //     text: spanGroup,
      //     entity: tag.slice(2)
      //   }
      // }
    });

    console.log("words:");
    console.log(hcWords);
    console.log("---------------------");
    console.log("tags:");
    console.log(hcTags);
    console.log("---------------------");
    console.log("formattedTokens:");
    console.log(formattedTokens);
    console.log("---------------------");
    console.log("dynamicTokens:");
    console.log(dynamicTokens);
    console.log("---------------------");

    return (
      <div className="pane model">
        <PaneLeft>
          <div className="model__content model__content--ner-output">
            <div className="form__field">
              <div className="passage model__content__summary highlight-container--bottom-labels">
                {formattedTokens.map((token, i) => <TokenSpan key={i} token={token} />)}
              </div>
            </div>
          </div>
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

const NerComponent = withRouter(_NerComponent)

export default NerComponent;
