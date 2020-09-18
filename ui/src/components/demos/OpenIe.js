import React from 'react';
import { Tabs } from '@allenai/varnish';
import { withRouter } from 'react-router-dom';

import Model from '../Model'
import HierplaneVisualization from '../HierplaneVisualization'
import TextVisualization from '../TextVisualization'
import { DemoVisualizationTabs } from './DemoStyles';

const title = "Open Information Extraction";

const description = (
  <span>
    <p>
      Given an input sentence, Open Information Extraction (Open IE) extracts a list of propositions, each composed of a single predicate and an arbitrary number of arguments.
      These extractions break syntactically complex sentences into the relationships they express, which can then be used for various downstream tasks.
    </p>
    <p>
      This page demonstrates a reimplementation of <a href="https://www.semanticscholar.org/paper/Supervised-Open-Information-Extraction-Stanovsky-Michael/c82921a426fd8090564f459b0bd90cdb1e7a9e2d" target="_blank" rel="noopener noreferrer">{' '} a deep BiLSTM sequence prediction model (Stanovsky et al., 2018)</a>.
    </p>
  </span>
)

const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/openie-model.2020.03.26.tar.gz'

const bashCommand =
    `echo '{"sentence": "John decided to run for office next month."}' | \\
allennlp predict ${modelUrl} -`
const pythonCommand =
    `from allennlp.predictors.predictor import Predictor
import allennlp_models.structured_prediction
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  sentence="John decided to run for office next month."
)`

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const defaultUsage = {
  installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
  bashCommand,
  pythonCommand,
  evaluationNote: (<span>
    The Open Information extractor was evaluated on the OIE2016 corpus.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can get the data on <a href="https://github.com/gabrielStanovsky/oie-benchmark">the corpus homepage</a>.
  </span>),
  trainingNote: (<span>
    The Open Information extractor was evaluated on the OIE2016 corpus.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can get the data on <a href="https://github.com/gabrielStanovsky/oie-benchmark">the corpus homepage</a>.
  </span>)
}

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: `E.g. "John likes and Bill hates ice cream."`}
]

/* NOTE: There is a ton of duplicated code between this demo and the SRL demo,
 * but the demos are subtlely different, so for now the duplication stays.
 */


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


const VisualizationType = {
  TREE: 'Tree',
  TEXT: 'Text'
};
Object.freeze(VisualizationType);

const Output = props => {
  const { responseData } = props
  const { verbs } = responseData

  return (
    <div className="model__content">
      <DemoVisualizationTabs>
          {
            Object.keys(VisualizationType).map(tpe => {
              const vizType = VisualizationType[tpe];
              let viz = null;
              switch(vizType) {
                case VisualizationType.TEXT:
                  viz = <TextVisualization verbs={verbs} model="oie"/>;
                  break;
                case VisualizationType.TREE:
                default:
                  viz = <HierplaneVisualization trees={toHierplaneTrees(responseData)} />
                  break;
              }
              return (
                <Tabs.TabPane key={vizType} tab={vizType}>
                  {viz}
                </Tabs.TabPane>
              )
            })
          }
      </DemoVisualizationTabs>
    </div>
  )
}

const examples = [
    "In December, John decided to join the party.",
    "Bob agreed to take out the trash",
    "Alex Honnold climbed up a New Jersey skyscraper.",
    "Albert Einstein, a German theoretical physicist, published the theory of relativity in 1915.",
    "Chair umpire Ramos managed to rob two players in the U.S. Open final.",
    "The CEO of a multi-million dollar company doesn't have much free time."
  ].map(sentence => ({sentence}))


const apiUrl = () => `/api/open-information-extraction/predict`;

const modelProps = {apiUrl, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
