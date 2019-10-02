import React from 'react';
import { withRouter } from 'react-router-dom';
import { ExternalLink } from '@allenai/varnish/components';

import { FormField } from '../Form';
import { API_ROOT } from '../../api-config';
import Model from '../Model'
import HighlightContainer from '../highlight/HighlightContainer';
import { Highlight, getHighlightColor } from '../highlight/Highlight';
import { UsageSection } from '../UsageSection';
import { UsageHeader } from '../UsageHeader';
import { UsageCode } from '../UsageCode';
import SyntaxHighlight from '../highlight/SyntaxHighlight';

const apiUrl = () => `${API_ROOT}/predict/coreference-resolution`

const title = "Co-reference Resolution";

const description = (
  <span>
    <span>
    Coreference resolution is the task of finding all expressions that refer to the same entity
    in a text. It is an important step for a lot of higher level NLP tasks that involve natural
    language understanding such as document summarization, question answering, and information extraction.
    </span>
    <ExternalLink href = "https://www.semanticscholar.org/paper/End-to-end-Neural-Coreference-Resolution-Lee-He/3f2114893dc44eacac951f148fbff142ca200e83" target="_blank" rel="noopener">{' '} End-to-end Neural Coreference Resolution ( Lee et al, 2017) {' '}</ExternalLink>
    <span>
    is a neural model which considers all possible spans in the document as potential mentions and
    learns distributions over possible anteceedents for each span, using aggressive, learnt
    pruning strategies to retain computational efficiency. It achieved state-of-the-art accuracies on
    </span>
    <ExternalLink href = "http://cemantix.org/data/ontonotes.html" target="_blank" rel="noopener">{' '} the Ontonotes 5.0 dataset {' '}</ExternalLink>
    <span>
    in early 2017.
    </span>
  </span>
);

const descriptionEllipsed = (
  <span>
    Coreference resolution is the task of finding all expressions that refer to the same entity in a text. It is an…
  </span>
)

const fields = [
    {name: "document", label: "Document", type: "TEXT_AREA",
     placeholder: "We 're not going to skimp on quality , but we are very focused to make next year . The only problem is that some of the fabrics are wearing out - since I was a newbie I skimped on some of the fabric and the poor quality ones are developing holes . For some , an awareness of this exit strategy permeates the enterprise , allowing them to skimp on the niceties they would more or less have to extend toward a person they were likely to meet again ." }
]

// Helper function for transforming response data into a tree object
const transformToTree = (tokens, clusters) => {
  // Span tree data transform code courtesy of Michael S.
  function contains(span, index) {
    return index >= span[0] && index <= span[1];
  }

  let insideClusters = [
    {
      cluster: -1,
      contents: [],
      end: -1
    }
  ];

  tokens.forEach((token, i) => {
    // Find all the new clusters we are entering at the current index
    let newClusters = [];
    clusters.forEach((cluster, j) => {
      // Make sure we're not already in this cluster
      if (!insideClusters.map((c) => c.cluster).includes(j)) {
        cluster.forEach((span) => {
          if (contains(span, i)) {
              newClusters.push({ end: span[1], cluster: j });
          }
        });
      }
    });

    // Enter each new cluster, starting with the leftmost
    newClusters.sort(function(a, b) { return b.end - a.end }).forEach((newCluster) => {
      // Descend into the new cluster
      insideClusters.push(
        {
          cluster: newCluster.cluster,
          contents: [],
          end: newCluster.end
        }
      );
    });

    // Add the current token into the current cluster
    insideClusters[insideClusters.length-1].contents.push(token);

    // Exit each cluster we're at the end of
    while (insideClusters.length > 0 && insideClusters[insideClusters.length-1].end === i) {
      const topCluster = insideClusters.pop();
      insideClusters[insideClusters.length-1].contents.push(topCluster);
    }
  });

  return insideClusters[0].contents;
}

// Stateful
class Output extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedCluster: -1,
      activeIds: [],
      activeDepths: {ids:[],depths:[]},
      selectedId: null,
      isClicking: false
    };

    this.handleHighlightMouseDown = this.handleHighlightMouseDown.bind(this);
    this.handleHighlightMouseOver = this.handleHighlightMouseOver.bind(this);
    this.handleHighlightMouseOut = this.handleHighlightMouseOut.bind(this);
    this.handleHighlightMouseUp = this.handleHighlightMouseUp.bind(this);
  }

  handleHighlightMouseDown(id, depth) {
    let depthTable = this.state.activeDepths;
    depthTable.ids.push(id);
    depthTable.depths.push(depth);

    this.setState({
      selectedId: null,
      activeIds: [id],
      activeDepths: depthTable,
      isClicking: true
    });
  }

  handleHighlightMouseUp(id, prevState) {
    const depthTable = this.state.activeDepths;
    const deepestIndex = depthTable.depths.indexOf(Math.max(...depthTable.depths));

    this.setState(prevState => ({
      selectedId: depthTable.ids[deepestIndex],
      isClicking: false,
      activeDepths: {ids:[],depths:[]},
      activeIds: [...prevState.activeIds, id],
    }));
  }

  handleHighlightMouseOver(id, prevState) {
    this.setState(prevState => ({
      activeIds: [...prevState.activeIds, id],
    }));
  }

  handleHighlightMouseOut(id, prevState) {
    this.setState(prevState => ({
      activeIds: prevState.activeIds.filter(i => (i === this.state.selectedId)),
    }));
  }

  render() {
    const { activeIds, activeDepths, isClicking, selectedId } = this.state;

    const { responseData } = this.props
    const { document, clusters } = responseData

    const spanTree = transformToTree(document, clusters);

    // This is the function that calls itself when we recurse over the span tree.
    const spanWrapper = (data, depth) => {
      return data.map((token, idx) =>
        typeof(token) === "object" ? (
          <Highlight
            key={idx}
            activeDepths={activeDepths}
            activeIds={activeIds}
            color={getHighlightColor(token.cluster)}
            depth={depth}
            id={token.cluster}
            isClickable={true}
            isClicking={isClicking}
            label={token.cluster}
            labelPosition="left"
            onMouseDown={this.handleHighlightMouseDown}
            onMouseOver={this.handleHighlightMouseOver}
            onMouseOut={this.handleHighlightMouseOut}
            onMouseUp={this.handleHighlightMouseUp}
            selectedId={selectedId}>
            {/* Call Self */}
            {spanWrapper(token.contents, depth + 1)}
          </Highlight>
        ) : (
          <span key={idx}>{token} </span>
        )
      );
    }

    return (
      <div className="model__content answer">
        <FormField>
          <HighlightContainer isClicking={isClicking}>
            {spanWrapper(spanTree, 0)}
          </HighlightContainer>
        </FormField>
      </div>
    );
  }
}

const examples = [
    {
      document: "Paul Allen was born on January 21, 1953, in Seattle, Washington, to Kenneth Sam Allen and Edna Faye Allen. Allen attended Lakeside School, a private school in Seattle, where he befriended Bill Gates, two years younger, with whom he shared an enthusiasm for computers. Paul and Bill used a teletype terminal at their high school, Lakeside, to develop their programming skills on several time-sharing computer systems."
    },
    {
      document: "The legal pressures facing Michael Cohen are growing in a wide-ranging investigation of his personal business affairs and his work on behalf of his former client, President Trump.  In addition to his work for Mr. Trump, he pursued his own business interests, including ventures in real estate, personal loans and investments in taxi medallions."
    },
    {
      document: "We are looking for a region of central Italy bordering the Adriatic Sea. The area is mostly mountainous and includes Mt. Corno, the highest peak of the mountain range. It also includes many sheep and an Italian entrepreneur has an idea about how to make a little money of them."
    }
  ]

const usage = (
  <React.Fragment>
    <UsageSection>
      <UsageHeader>Prediction</UsageHeader>
      <strong>On the command line (bash):</strong>
      <UsageCode>
        <SyntaxHighlight language="bash">
          {`echo '{"document": "The woman reading a newspaper sat on the bench with her dog."}' | \\
  allennlp predict https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz -`} />
        </SyntaxHighlight>
      </UsageCode>
      <strong>As a library (Python):</strong>
      <UsageCode>
        <SyntaxHighlight language="python">
          {`from allennlp.predictors.predictor import Predictor
predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/coref-model-2018.02.05.tar.gz")
predictor.predict(
  document="The woman reading a newspaper sat on the bench with her dog."
)`}
        </SyntaxHighlight>
      </UsageCode>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Evaluation</UsageHeader>
      <p>
        The Coreference model was evaluated on the CoNLL 2012 dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
        This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
      </p>
    </UsageSection>
    <UsageSection>
      <UsageHeader>Training</UsageHeader>
      <p>
        The Coreference model was evaluated on the CoNLL 2012 dataset.
        Unfortunately we cannot release this data due to licensing restrictions by the LDC.
        To compile the data in the right format for evaluating the Coreference model, please see scripts/compile_coref_data.sh.
        This script requires the Ontonotes 5.0 dataset, available on <a href="https://catalog.ldc.upenn.edu/ldc2013t19">the LDC website</a>.
      </p>
    </UsageSection>
  </React.Fragment>
)

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output, usage}

export default withRouter(props => <Model {...props} {...modelProps}/>)
