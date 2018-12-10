import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneLeft, PaneRight } from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'
import { Tree } from 'hierplane';

const title = "Open Information Extraction";

const description = (
  <span>
    <span>
    Given an input sentence, Open Information Extraction (Open IE) extracts a list of
  propositions, each composed of a single predicate and an arbitrary number of arguments.
    These often simplify syntactically complex sentences, and make their predicate-argument structure easily accessible for various downstream tasks.
    The AllenNLP toolkit provides the following Open IE visualization, which can be used for any Open IE model in AllenNLP.
      This page demonstrates a reimplementation of
    </span>
    <a href="https://www.semanticscholar.org/paper/Supervised-Open-Information-Extraction-Stanovsky-Michael/c82921a426fd8090564f459b0bd90cdb1e7a9e2d" target="_blank" rel="noopener noreferrer">{' '} a deep BiLSTM sequence prediction model (Stanovsky et al., 2018)</a>.
  </span>
)

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "John likes and Bill hates ice cream."`}
]

const attributeToDisplayLabel = {
  "PRP": "Purpose",
  "COM": "Comitative",
  "LOC" : "Location",
  "DIR" : "Direction",
  "GOL": "Goal",
  "MNR": "Manner",
  "TMP": "Temporal",
  "EXT": "Extent",
  "REC": "Reciprocal",
  "PRD": "Secondary Predication",
  "CAU": "Cause",
  "DIS": "Discourse",
  "MOD": "Modal",
  "NEG": "Negation",
  "DSP": "Direct Speech",
  "LVB": "Light Verb",
  "ADV": "Adverbial",
  "ADJ": "Adjectival",
  "PNC": "Purpose not cause"
};

function getStrIndex(words, wordIdx) {
  if (wordIdx < 0) throw new Error(`Invalid word index: ${wordIdx}`);
  return words.slice(0, wordIdx).join(' ').length;
}

function toHierplaneTrees(response) {
  const text = response.words.join(' ');

  // We create a tree for each verb
  const trees = response.verbs.map(({ verb, tags }) => {
    const verbTagIdx = tags.findIndex(tag => tag === 'B-V');
    var fullPredicate = response.words[verbTagIdx]; // Variable to collect the full predicate from the "V" BIO tags.
    const start = getStrIndex(response.words, verbTagIdx);

    const ignoredSpans = tags.reduce((allChildren, tag, idx) => {
      if (tag === 'O') {
        const word = response.words[idx];
        const start = getStrIndex(response.words, idx);
        const end = start + word.length + 1;
        const child = {
          spanType: 'ignored',
          start,
          end
        };
        allChildren.push(child);
      }
      return allChildren;
    }, []);

    // Keep a map of each children, by it's parent, so that we can attach them in a single
    // pass after building up the immediate children of this node
    const childrenByArg = {};

    const children = tags.reduce((allChildren, tag, idx) => {
      if (tag !== 'B-V' && tag.startsWith('B-')) {
        const word = response.words[idx];
        const tagParts = tag.split('-').slice(1);

        let [ tagLabel, attr ] = tagParts;

        // Convert the tag label to a node type. In the long run this might make sense as
        // a map / lookup table of some sort -- but for now this works.
        let nodeType = tagLabel;
        if (tagLabel === 'ARGM') {
          nodeType = 'modifier';
        } else if (tagLabel === 'ARGA') {
          nodeType = 'argument';
        } else if (/ARG\d+/.test(tagLabel)) {
          nodeType = 'argument';
        } else  if (tagLabel === 'R') {
          nodeType = 'reference';
        } else if (tagLabel === 'C') {
          nodeType = 'continuation'
        }

        let attribute;
        const isArg = nodeType === 'argument';
        if (isArg) {
          attribute = tagLabel;
        } else if(attr) {
          attribute = attributeToDisplayLabel[attr];
        }

        const start = getStrIndex(response.words, idx);
        const newChild = {
          word,
          spans: [{
            start,
            end: start + word.length + 1
          }],
          nodeType,
          link: nodeType,
          attributes: attribute ? [ attribute ] : undefined
        };

        if (attr && (tagLabel === 'R' || tagLabel === 'C')) {
          if (!childrenByArg[attribute]) {
            childrenByArg[attr] = [];
          }
          childrenByArg[attr].push(newChild);
        } else {
          allChildren.push(newChild);
        }
      } else if (tag.startsWith('I-') && tag !== 'I-V') {
        const word = response.words[idx];
        const lastChild = allChildren[allChildren.length - 1];
        lastChild.word += ` ${word}`;
        lastChild.spans[0].end += word.length + 1;
      } else if (tag === "I-V") {
        // Predicate continuation
        fullPredicate += ` ${response.words[idx]}`;
      }
      return allChildren;
    }, []);

    children.filter(c => c.nodeType === 'argument').map(c => {
      c.children = childrenByArg[c.attributes[0]];
      return c;
    });

    return {
      text,
      root: {
        word: fullPredicate,
        nodeType: 'V',
        attributes: [ 'VERB' ],
        spans: [{
          start,
          end: start + fullPredicate.length + 1,
        }, ...ignoredSpans],
        children
      }
    };
  });

  // Filter out the trees without any children, as Hierplane can't render something that isn't
  // a tree of at least one level. We can remove this once this bug is fixed:
  // https://github.com/allenai/hierplane/issues/74
  return trees.filter(t => t.root.children.length > 0);
}

class OpenIeInput extends React.Component {
  constructor(props) {
    super(props);

    // If we're showing a permalinked result, we'll get passed in a sentence.
    const { sentence } = props;

    this.state = {
      openieSentenceValue: sentence || "",
    };
    this.handleListChange = this.handleListChange.bind(this);
    this.handleSentenceChange = this.handleSentenceChange.bind(this);
  }

  handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
        openieSentenceValue: openieSentences[e.target.value],
      });
    }
  }

  handleSentenceChange(e) {
    this.setState({
      openieSentenceValue: e.target.value,
    });
  }

  render() {
    const { openieSentenceValue } = this.state;
    const { outputState, runOpenIeModel } = this.props;

    const openieInputs = {
      "sentenceValue": openieSentenceValue,
    };

    return (
      <div className="model__content">
        <ModelIntro title={title} description={description} />
        <div className="form__instructions"><span>Enter text or</span>
          <select disabled={outputState === "working"} onChange={this.handleListChange}>
            <option>Choose an example...</option>
            {openieSentences.map((sentence, index) => {
              return (
                <option value={index} key={index}>{sentence}</option>
              );
            })}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="#input--oie-sentence">Sentence</label>
          <input onChange={this.handleSentenceChange} value={openieSentenceValue} id="input--oie-sentence" ref="openieSentence" type="text" required="true" autoFocus="true" placeholder="E.g. &quot;John likes and Bill hates ice cream.&quot;" />
        </div>
        <div className="form__field form__field--btn">
          <Button enabled={outputState !== "working"} outputState={outputState} runModel={runOpenIeModel} inputs={openieInputs} />
        </div>
      </div>
    );
  }
}


/*******************************************************************************
  <OpenIeOutput /> Component
*******************************************************************************/

class OpenIeOutput extends React.Component {
  render() {
    const { verbs } = this.props;

    return (
      <div className="model__content model__content--oie-output">
        <div>
          {verbs.map((verb, i) => {
              return (
                  <p key={i}><b>{verb.verb}:</b> {verb.description}</p>
              )
          })}
        </div>
      </div>
    );
  }
}

class HierplaneVisualization extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { selectedIdx: 0 };

    this.selectPrevVerb = this.selectPrevVerb.bind(this);
    this.selectNextVerb = this.selectNextVerb.bind(this);
  }
  selectPrevVerb() {
    const nextIdx =
        this.state.selectedIdx === 0 ? this.props.trees.length - 1 : this.state.selectedIdx - 1;
    this.setState({ selectedIdx: nextIdx });
  }
  selectNextVerb() {
    const nextIdx =
        this.state.selectedIdx === this.props.trees.length - 1 ? 0 : this.state.selectedIdx + 1;
    this.setState({ selectedIdx: nextIdx });
  }

  render() {
    if (this.props.trees) {
      const verbs = this.props.trees.map(({ root: { word } }) => word);

      const totalVerbCount = verbs.length;
      const selectedVerbIdxLabel = this.state.selectedIdx + 1;
      const selectedVerb = verbs[this.state.selectedIdx];

      return (
        <div className="hierplane__visualization">
          <div className="hierplane__visualization-verbs">
            <a className="hierplane__visualization-verbs__prev" onClick={this.selectPrevVerb}>
              <svg width="12" height="12">
                <use xlinkHref="#icon__disclosure"></use>
              </svg>
            </a>
            <a onClick={this.selectNextVerb}>
              <svg width="12" height="12">
                <use xlinkHref="#icon__disclosure"></use>
              </svg>
            </a>
            <span className="hierplane__visualization-verbs__label">
              Verb {selectedVerbIdxLabel} of {totalVerbCount}: <strong>{selectedVerb}</strong>
            </span>
          </div>
          <Tree tree={this.props.trees[this.state.selectedIdx]} theme="light" />
        </div>
      )
    } else {
      return null;
    }
  }
}

/*******************************************************************************
  <OpenIeComponent /> Component
*******************************************************************************/

const VisualizationType = {
  TREE: 'Tree',
  TEXT: 'Text'
};
Object.freeze(VisualizationType);

class _OpenIeComponent extends React.Component {
  constructor(props) {
    super(props);

    const { requestData, responseData } = props;

    this.state = {
      requestData: requestData,
      responseData: responseData,
      // valid values: "working", "empty", "received", "error",
      outputState: responseData ? "received" : "empty",
      visualizationType: VisualizationType.TREE
    };

    this.runOpenIeModel = this.runOpenIeModel.bind(this);
  }

  runOpenIeModel(event, inputs) {
    this.setState({outputState: "working"});

    var payload = {sentence: inputs.sentenceValue};

    fetch(`${API_ROOT}/predict/open-information-extraction`, {
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
      const newPath = slug ? '/open-information-extraction/' + slug : '/open-information-extraction';

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
    const { visualizationType } = this.state;

    const sentence = requestData && requestData.sentence;
    const verbs = responseData && responseData.verbs;

    let viz = null;
    switch(visualizationType) {
      case VisualizationType.TEXT:
        viz = <OpenIeOutput verbs={verbs} />;
        break;
      case VisualizationType.TREE:
      default:
        viz = <HierplaneVisualization trees={responseData ? toHierplaneTrees(responseData) : null} />
        break;
    }

    return (
      <div className="pane model">
        <PaneLeft>
          <OpenIeInput runOpenIeModel={this.runOpenIeModel}
            outputState={this.state.outputState}
            sentence={sentence} />
        </PaneLeft>
        <PaneRight outputState={this.state.outputState}>
          <ul className="visualization-types">
            {Object.keys(VisualizationType).map(tpe => {
              const vizType = VisualizationType[tpe];
              const className = (
                visualizationType === vizType
                  ? 'oie__visualization-types__active-type'
                  : null
              );
              return (
                <li key={vizType} className={className}>
                  <a onClick={() => this.setState({ visualizationType: vizType })}>
                    {vizType}
                  </a>
                </li>
              );
            })}
          </ul>
          {viz}
        </PaneRight>
      </div>
    );
  }
}

const examples = [
    "In December, John decided to join the party.",
    "Bob agreed to take out the trash",
    "Alex Honnold climbed up a New Jersey skyscraper.",
    "Albert Einstein, a German theoretical physicist, published the theory of relativity in 1915.",
    "Chair umpire Ramos managed to rob two players in the U.S. Open final.",
    "The CEO of a multi-million dollar company doesn't have much free time."
  ].map(sentence => ({sentence}))


const OpenIeComponent = withRouter(_OpenIeComponent)

export default OpenIeComponent;
