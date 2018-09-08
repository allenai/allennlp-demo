import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom';
import { PaneLeft, PaneRight } from './Pane';
import Button from './Button';
import HighlightContainer from './highlight/HighlightContainer';
import { Highlight, getHighlightColor } from './highlight/Highlight';
import ModelIntro from './ModelIntro';

const corefExamples = [
  {
    document: "Paul Allen was born on January 21, 1953, in Seattle, Washington, to Kenneth Sam Allen and Edna Faye Allen. Allen attended Lakeside School, a private school in Seattle, where he befriended Bill Gates, two years younger, with whom he shared an enthusiasm for computers. Paul and Bill used a teletype terminal at their high school, Lakeside, to develop their programming skills on several time-sharing computer systems."
  },
  {
    document: "The legal pressures facing Michael Cohen are growing in a wide-ranging investigation of his personal business affairs and his work on behalf of his former client, President Trump.  In addition to his work for Mr. Trump, he pursued his own business interests, including ventures in real estate, personal loans and investments in taxi medallions."
  },
  {
    document: "We are looking for a region of central Italy bordering the Adriatic Sea. The area is mostly mountainous and includes Mt. Corno, the highest peak of the mountain range. It also includes many sheep and an Italian entrepreneur has an idea about how to make a little money of them."
  }
];

const title = "Co-reference Resolution";
const description = (
  <span>
    <span>
    Coreference resolution is the task of finding all expressions that refer to the same entity
    in a text. It is an important step for a lot of higher level NLP tasks that involve natural
    language understanding such as document summarization, question answering, and information extraction.
    </span>
    <a href = "https://www.semanticscholar.org/paper/End-to-end-Neural-Coreference-Resolution-Lee-He/3f2114893dc44eacac951f148fbff142ca200e83" target="_blank" rel="noopener noreferrer">{' '} End-to-end Neural Coreference Resolution ( Lee et al, 2017) {' '}</a>
    <span>
    is a neural model which considers all possible spans in the document as potential mentions and
    learns distributions over possible anteceedents for each span, using aggressive, learnt
    pruning strategies to retain computational efficiency. It achieved state-of-the-art accuracies on
    </span>
    <a href = "http://cemantix.org/data/ontonotes.html" target="_blank" rel="noopener noreferrer">{' '} the Ontonotes 5.0 dataset {' '}</a>
    <span>
    in early 2017.
    </span>
  </span>
);

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

/*******************************************************************************
  <CorefInput /> Component
*******************************************************************************/

class CorefInput extends React.Component {
  constructor(props) {
    super(props);

    // If we're showing a permalinked result, we'll get passed in a document.
    const { doc } = props;

    this.state = {
      corefDocumentValue: doc || "",
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleDocumentChange = this.handleDocumentChange.bind(this);
  }

  handleListChange(e) {
    if (e.target.value !== "") {
      this.setState({
        corefDocumentValue: corefExamples[e.target.value].document,
      });
    }
  }

  handleDocumentChange(e) {
    this.setState({
      corefDocumentValue: e.target.value,
    });
  }

  handleKeyDown(e, inputs) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.props.runCorefModel(e, inputs);
    }
  }

  render() {
    const { corefDocumentValue } = this.state;
    const { outputState, runCorefModel } = this.props;

    const corefInputs = {
      "documentValue": corefDocumentValue,
    };

    const callHandleKeyDown = (e) => { this.handleKeyDown(e, corefInputs)};

    return (
      <div className="model__content">
        <ModelIntro title={title} description={description} />
        <div className="form__instructions"><span>Enter text or</span>
          <select disabled={outputState === "working"} onChange={this.handleListChange} onKeyDown={callHandleKeyDown}>
            <option value="">Choose an example...</option>
            {corefExamples.map((example, index) => {
              return (
                <option value={index} key={index}>{example.document.substring(0,60) + ".. ."}</option>
              );
            })}
          </select>
        </div>
        <div className="form__field">
          <label htmlFor="#input--mc-passage">Document</label>
          <textarea onChange={this.handleDocumentChange} onKeyDown={callHandleKeyDown} id="input--mc-passage" type="text"
            required="true" autoFocus="true" placeholder="We 're not going to skimp on quality , but we are very focused to make next year . The only problem is that some of the fabrics are wearing out - since I was a newbie I skimped on some of the fabric and the poor quality ones are developing holes . For some , an awareness of this exit strategy permeates the enterprise , allowing them to skimp on the niceties they would more or less have to extend toward a person they were likely to meet again ." value={corefDocumentValue} disabled={outputState === "working"}></textarea>
        </div>
        <div className="form__field form__field--btn">
          <Button enabled={outputState !== "working"} outputState={outputState} runModel={runCorefModel} inputs={corefInputs} />
        </div>
      </div>
    );
  }
}

/*******************************************************************************
  <CorefOutput /> Component
*******************************************************************************/

class CorefOutput extends React.Component {
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
    const { tokens, clusters } = this.props;

    const spanTree = transformToTree(tokens, clusters);

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
      <div className="model__content">
        <div className="form__field">
          <HighlightContainer isClicking={isClicking}>
            {spanWrapper(spanTree, 0)}
          </HighlightContainer>
        </div>
      </div>
    );
  }
}

/*******************************************************************************
  <CorefComponent /> Component
*******************************************************************************/

class _CorefComponent extends React.Component {
  constructor(props) {
    super(props);

    const { requestData, responseData } = props;

    this.state = {
      requestData: requestData,
      responseData: responseData,
      outputState: responseData ? "received" : "empty" // valid values: "working", "empty", "received", "error"
    };

    this.runCorefModel = this.runCorefModel.bind(this);
  }

  runCorefModel(event, inputs) {
    this.setState({
      outputState: "working",
    });

    var payload = {
      document: inputs.documentValue,
    };

    fetch(`${API_ROOT}/predict/coreference-resolution`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      return response.json();
    }).then((json) => {
      // If the response contains a `slug` for a permalink, we want to redirect
      // to the corresponding path using `history.push`.
      const { slug } = json;
      const newPath = slug ? '/coreference-resolution/' + slug : '/coreference-resolution';

      // We'll pass the request and response data along as part of the location object
      // so that the `Demo` component can use them to re-render.
      const location = {
        pathname: newPath,
        state: { requestData: payload, responseData: json }
      }
      this.props.history.push(location);
    }).catch((error) => {
      this.setState({outputState: "error"});
      console.error(error);
    });
  }

  render() {
    const { requestData, responseData } = this.props;

    const inputDoc = requestData && requestData.document;
    const tokens = responseData && responseData.document;
    const clusters = responseData && responseData.clusters;

    return (
      <div className="pane model">
        <PaneLeft>
          <CorefInput runCorefModel={this.runCorefModel} outputState={this.state.outputState} doc={inputDoc}/>
        </PaneLeft>
        <PaneRight outputState={this.state.outputState}>
          <CorefOutput tokens={tokens} clusters={clusters}/>
        </PaneRight>
      </div>
    );
  }
}

const CorefComponent = withRouter(_CorefComponent)

export default CorefComponent;
