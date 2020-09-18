import React from 'react';
import { Tabs } from '@allenai/varnish';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import Model from '../Model'
import HierplaneVisualization from '../HierplaneVisualization'
import TextVisualization from '../TextVisualization'
import { DemoVisualizationTabs } from './DemoStyles';

const title = "Semantic Role Labeling"

const description = (
    <span>
      <p>
        Semantic Role Labeling (SRL) is the task of determining the latent predicate argument structure of a sentence and providing representations that can answer basic questions about sentence meaning, including <em>who</em> did <em>what</em> to <em>whom</em>, etc.
      </p>
      <p>
        This page demonstrates a reimplementation
        of <a href="https://arxiv.org/abs/1904.05255" target="_blank" rel="noopener noreferrer">a BERT based model (Shi et al, 2019)</a> with
        some modifications (no additional parameters apart from a linear classification layer), which is currently the state of the art single model for English PropBank SRL (Newswire sentences). It achieves 86.49 test F1 on the Ontonotes 5.0 dataset.
      </p>
    </span>
  );

const modelUrl = 'https://storage.googleapis.com/allennlp-public-models/bert-base-srl-2020.03.24.tar.gz'

const bashCommand =
    `echo '{"sentence": "Did Uriah honestly think he could beat the game in under three hours?"}' | \\
allennlp predict ${modelUrl} -`

const pythonCommand =
    `from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("${modelUrl}")
predictor.predict(
  sentence="Did Uriah honestly think he could beat the game in under three hours?"
)`

// tasks that have only 1 model, and models that do not define usage will use this as a default
// undefined is also fine, but no usage will be displayed for this task/model
const defaultUsage = {
  installCommand: 'pip install allennlp==1.0.0 allennlp-models==1.0.0',
  bashCommand,
  pythonCommand,
  evaluationNote: (<span>
    The SRL model was evaluated on the CoNLL 2012 dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can put together evaluation data yourself by following the CoNLL 2012 <a href="http://conll.cemantix.org/2012/data.html">instructions for working with the data</a>.
  </span>),
  trainingNote: (<span>
    The SRL model was evaluated on the CoNLL 2012 dataset.
    Unfortunately we cannot release this data due to licensing restrictions by the LDC.
    You can put together evaluation data yourself by following the CoNLL 2012 instructions for working with the data.
    Once you have compiled the dataset, you can use the configuration file at <a href="https://github.com/allenai/allennlp/blob/master/training_config/semantic_role_labeler.jsonnet">training_config/semantic_role_labeler.jsonnet</a> to train.
  </span>)
}

const fields = [
    {name: "sentence", label: "Sentence", type: "TEXT_INPUT",
     placeholder: 'E.g. "John likes and Bill hates ice cream."'}
]

// Output

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
      } else if (tag.startsWith('I-')) {
        const word = response.words[idx];
        const lastChild = allChildren[allChildren.length - 1];
        lastChild.word += ` ${word}`;
        lastChild.spans[0].end += word.length + 1;
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
        word: verb,
        nodeType: 'V',
        attributes: [ 'VERB' ],
        spans: [{
          start,
          end: start + verb.length + 1,
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

const NoOutputMessage = styled.div`
  padding: 2rem;
`;

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

              // If there's no verbs, there's no output to display.
              if (Array.isArray(verbs) && verbs.length > 0) {
                switch(vizType) {
                  case VisualizationType.TEXT:
                    viz = <TextVisualization verbs={verbs} model="srl" />;
                    break;
                  case VisualizationType.TREE:
                  default:
                    viz = <HierplaneVisualization trees={toHierplaneTrees(responseData)} />
                    break;
                }
              }

              if (viz == null) {
                return (
                  <NoOutputMessage>
                    No output. Please revise the sentence and try again.
                  </NoOutputMessage>
                );
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
    "The keys, which were needed to access the building, were locked in the car.",
    "However, voters decided that if the stadium was such a good idea someone would build it himself, and rejected it 59% to 41%.",
    "Did Uriah honestly think he could beat the game in under three hours?",
    "If you liked the music we were playing last night, you will absolutely love what we're playing tomorrow!",
    "More than a few CEOs say the red-carpet treatment tempts them to return to a heartland city for future meetings.",
].map(sentence => ({sentence}))

const apiUrl = () => `/api/semantic-role-labeling/predict`

const modelProps = {apiUrl, title, description, fields, examples, Output, defaultUsage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
