import React from 'react';
import { withRouter } from 'react-router-dom';
import { ExternalLink } from '@allenai/varnish/components';

import { FormField } from '../Form';
import { API_ROOT } from '../../api-config';
import Model from '../Model'
import HighlightContainer from '../highlight/HighlightContainer';
import { Highlight, getHighlightColor } from '../highlight/Highlight';

import OutputField from '../OutputField'
import { Accordion,
         AccordionItem,
         AccordionItemTitle,
         AccordionItemBody } from 'react-accessible-accordion';
import { SaliencyComponent, getHeaders } from '../Saliency'
import InputReductionComponent from '../InputReduction'
import HotflipComponent from '../Hotflip'
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER,
  HOTFLIP_ATTACKER
} from '../InterpretConstants'

const apiUrl = () => `${API_ROOT}/predict/coreference-resolution`
const apiUrlAttack = ({attacker, name_of_input_to_attack, name_of_grad_input}) => `${API_ROOT}/attack/coreference-resolution/${attacker}/${name_of_input_to_attack}/${name_of_grad_input}`
const apiUrlInterpret = ({interpreter}) => `${API_ROOT}/interpret/coreference-resolution/${interpreter}`


const title = "Co-reference Resolution";

const NAME_OF_INPUT_TO_ATTACK = "text"
const NAME_OF_GRAD_INPUT = "grad_input_1"

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
export const transformToTree = (tokens, clusters) => {
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

const generateSaliencyMaps = (interpretData, words, interpretModel, requestData, num_clusters, interpreterType) => {  
  let saliencyMaps = []
  if (interpretData === undefined || interpretData[interpreterType] == undefined){
    saliencyMaps.push(      
      <SaliencyComponent interpretData={interpretData} input1Tokens={words} interpretModel = {interpretModel} requestData = {requestData} interpreter={interpreterType}/>
    )
  }
  else {
    let indexedInterpretDataList = []
    const num_grads = num_clusters;
    for (let i = 1; i <= num_grads; ++i) {
      indexedInterpretDataList.push(JSON.parse(JSON.stringify(interpretData)));
    }
    for (let i = 1; i <= num_grads; ++i) {
      const index = num_grads-i;
      console.log(index);
      console.log(indexedInterpretDataList.length);
      Object.keys(indexedInterpretDataList[index][interpreterType]).forEach(function(itm){
        if (itm == 'instance_' + (index+1).toString()){          
          indexedInterpretDataList[index][interpreterType]['instance_1'] = indexedInterpretDataList[index][interpreterType][itm]
        }
        else if (itm != 'instance_1'){
          delete indexedInterpretDataList[index][interpreterType][itm];
        }      
      });            
      saliencyMaps.push(
        <div key={index} style={{ display: "flex", flexWrap: "wrap" }}>
          <p><strong>Showing interpretation for cluster {i-1}</strong></p>
          <SaliencyComponent interpretData={indexedInterpretDataList[index]} input1Tokens={words} interpretModel = {interpretModel} requestData = {requestData} interpreter={interpreterType} task={title}/>          
        </div>
      )      
      // spacing between saliency maps      
      saliencyMaps.push(
        <div>          
          <br />
        </div>
      )
    }  
    let result = [];
    const [title1, title2] = getHeaders(interpreterType);
    result.push(
      <div>
        <AccordionItem expanded={true}>
          <AccordionItemTitle>
              {title1}
              <div className="accordion__arrow" role="presentation"/>
          </AccordionItemTitle>
          <AccordionItemBody>
              <div className="content">                
                {title2}
              </div>              
              {saliencyMaps}        
          </AccordionItemBody>
        </AccordionItem>
      </div>
    )
    return result
  }

  return saliencyMaps
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

    const { responseData, requestData, interpretData, interpretModel, attackData, attackModel } = this.props
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
    const gradSaliencyMap = generateSaliencyMaps(interpretData, document, interpretModel, requestData, clusters.length, GRAD_INTERPRETER)    
    const igSaliencyMap = generateSaliencyMaps(interpretData, document, interpretModel, requestData, clusters.length, IG_INTERPRETER)    
    const sgSaliencyMap = generateSaliencyMaps(interpretData, document, interpretModel, requestData, clusters.length, SG_INTERPRETER)    

    return (
      <div className="model__content answer">
        <FormField>
          <HighlightContainer isClicking={isClicking}>
            {spanWrapper(spanTree, 0)}
          </HighlightContainer>
        </FormField>
        <OutputField>
          <Accordion accordion={false}>
            {gradSaliencyMap}
            {igSaliencyMap}
            {sgSaliencyMap}
            <HotflipComponent hotflipData={attackData} hotflipInput={attackModel} requestDataObject={requestData} task={title} attacker={HOTFLIP_ATTACKER} nameOfInputToAttack={NAME_OF_INPUT_TO_ATTACK} nameOfGradInput={NAME_OF_GRAD_INPUT}/>
          </Accordion>
        </OutputField>
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

const modelProps = {apiUrl, apiUrlInterpret, apiUrlAttack, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
