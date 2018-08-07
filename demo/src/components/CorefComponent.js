import React from 'react';
import { API_ROOT } from '../api-config';
import { withRouter } from 'react-router-dom'
import {PaneLeft, PaneRight} from './Pane'
import Button from './Button'
import ModelIntro from './ModelIntro'


/*******************************************************************************
  <CorefInput /> Component
*******************************************************************************/

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


class CorefInput extends React.Component {
    constructor(props) {
        super(props);

        // If we're showing a permalinked result, we'll get passed in a document.
        const { doc } = props;

        this.state = {
        corefDocumentValue: doc || "",
        };

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

    render() {
        const { corefDocumentValue } = this.state;
        const { outputState, runCorefModel } = this.props;

        const corefInputs = {
          "documentValue": corefDocumentValue,
        };

        return (
            <div className="model__content">
            <ModelIntro title={title} description={description} />
                <div className="form__instructions"><span>Enter text or</span>
                <select disabled={outputState === "working"} onChange={this.handleListChange}>
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
                <textarea onChange={this.handleDocumentChange} id="input--mc-passage" type="text"
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
      };
      this.onClusterMouseover = this.onClusterMouseover.bind(this);
    }

    onClusterMouseover(index) {
      this.setState( { selectedCluster: index });
    }

    render() {
      const { doc, clusters } = this.props;
      var clusteredDocument = doc.map((word, wordIndex) => {
        var membershipClusters = [];
        clusters.forEach((cluster, clusterIndex) => {
          cluster.forEach((span) => {
            if (wordIndex >= span[0] && wordIndex <= span[1]) {
              membershipClusters.push(clusterIndex);
            }
          });
        });
        return { word : word, clusters : membershipClusters }
      });

      var wordStyle = (clusteredWord) => {
        var clusters = clusteredWord['clusters'];

        if (clusters.includes(this.state.selectedCluster)) {
          return "coref__span";
        }
        else {
          return "unselected";
        }
      }

      return (
        <div className="model__content">
          <div className="form__field">
            <label>Clusters</label>
            <div className="model__content__summary">
            <ul>
              {clusters.map((cluster, index) =>
               <li key={ index }>
                {cluster.map((span, wordIndex) =>
                  <a key={ wordIndex } onMouseEnter={ () => this.onClusterMouseover(index) }> {doc.slice(span[0], span[1] + 1).join(" ")},</a>
                )}
               </li>
            )}
            </ul>
            </div>
          </div>

          <div className="form__field">
            <label>Document</label>
            <div className="passage model__content__summary">
            {clusteredDocument.map((clusteredWord, index) =>
              <span key={ index } className={ wordStyle(clusteredWord) }> {clusteredWord['word']}</span>
            )}
            </div>
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
      const outputDoc = responseData && responseData.document;
      const clusters = responseData && responseData.clusters;

      return (
        <div className="pane model">
          <PaneLeft>
            <CorefInput runCorefModel={this.runCorefModel} outputState={this.state.outputState} doc={inputDoc}/>
          </PaneLeft>
          <PaneRight outputState={this.state.outputState}>
            <CorefOutput doc={outputDoc} clusters={clusters}/>
          </PaneRight>
        </div>
      );
    }
}

const CorefComponent = withRouter(_CorefComponent)

export default CorefComponent;
