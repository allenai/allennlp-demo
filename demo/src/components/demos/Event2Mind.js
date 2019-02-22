import React from 'react';
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import HighlightArrow from '../highlight/HighlightArrow';
import HighlightContainer from '../highlight/HighlightContainer';
import { Highlight } from '../highlight/Highlight';
import Model from '../Model'
import '../../css/Event2MindDiagram.css';

const title = "Event2Mind"

const description = (
  <span>
    <span>
      The Event2Mind dataset proposes a commonsense inference task between events and mental states. In particular, it takes events as lightly preprocessed text and produces likely intents and reactions for participants of the event.
      This page demonstrates a reimplementation of
    </span>
    <a href="https://www.semanticscholar.org/paper/b89f8a9b2192a8f2018eead6b135ed30a1f2144d" target="_blank" rel="noopener noreferrer">{' '} the original Event2Mind system (Rashkin et al, 2018)</a>
    <span>
      . An event with people entities should be typed as "PersonX" or "PersonY". Optionally, "___" can be used as a placeholder for objects or phrases.
    </span>
  </span>
)

const descriptionEllipsed = (
  <span>
    The Event2Mind dataset proposes a commonsense inference task between events and mental states. In…
  </span>
)

const fields = [
    {name: "source", label: "Event", type: "TEXT_INPUT",
     placeholder: `E.g. "PersonX eats ice cream."`}
]

const supportedTargetTypes = [
  {
    responseDataKey: "xintent_top_k_predicted_tokens",
    prettyLabel: "Person X's Intent",
    color: "blue",
    noneDescription: "no intent"
  },
  {
    responseDataKey: "xreact_top_k_predicted_tokens",
    prettyLabel: "Person X's Reaction",
    color: "orange",
    noneDescription: "no reaction"
  },
  {
    responseDataKey: "oreact_top_k_predicted_tokens",
    prettyLabel: "Other's Reaction",
    color: "orange",
    noneDescription: "no others involved"
  }
];

// Remove the special "@@UNKNOWN@@" token from model output, replace "none", join tokens.
function processTokens(tokens, noneReplacement) {
  return tokens.filter(target => {
    return !(target.length === 1 && target[0] === "@@UNKNOWN@@");
  }).map(target => {
    if (target.length === 1 && target[0] === "none") {
      return <em> {noneReplacement} </em>;
    } else {
      return target.join(" ");
    }
  })
}

const DiagramOutput = ({ responseData, source }) => {
    return (
      <div className="model__content answer">
        <HighlightContainer layout="diagram">
          <div className="e2m-event-container">
            <Highlight label="Event" color="gray" labelPosition="top">{source}</Highlight>
          </div>

          <div className="e2m-mind-container">
            {supportedTargetTypes.map((targetType, i) => {
              const tokens = processTokens(
                  responseData[targetType.responseDataKey], targetType.noneDescription
              )
              return (
                <div className="e2m-mind-container__target-type" key={i}>
                  <HighlightArrow color={targetType.color} direction="right" />
                  <Highlight label={targetType.prettyLabel} color={targetType.color} labelPosition="top">
                    <span>
                      {tokens.map((target, j) => {
                        return (
                          <span key={j}>{target}{j !== tokens.length - 1 ? ", " : ""}</span>
                        )
                      })}
                    </span>
                  </Highlight>
                </div>
              )
            })}
          </div>
        </HighlightContainer>
      </div>
    );
}

const TextOutput = ({ responseData }) => (
      <div className="model__content model__content--event2Mind-output">
        {supportedTargetTypes.map((targetType, i) => {
          const tokens = processTokens(
              responseData[targetType.responseDataKey], targetType.noneDescription
          )
          return (
            <div key={i}>
              {i !== 0 ? (
                <div>
                  <hr />
                  <h3>{targetType.prettyLabel}</h3>
                </div>
              ) : (
                <h3 className="no-top-margin">{targetType.prettyLabel}</h3>
              )}
              {tokens.map((target, j) => {
                return (
                  <p key={j}>&nbsp;<strong>{j}:</strong> {target}</p>
                )
              })}
            </div>
          )
        })}
      </div>
)

const VisualizationType = {
  DIAGRAM: 'Diagram',
  TEXT: 'Text'
};
Object.freeze(VisualizationType);

// Stateful
class Output extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visualizationType: VisualizationType.DIAGRAM
    }
  }

  render() {
    const { requestData, responseData } = this.props;
    const { visualizationType } = this.state;
    const { source } = requestData

    const viz = visualizationType === VisualizationType.TEXT
            ? <TextOutput responseData={responseData} />
            : <DiagramOutput responseData={responseData} source={source} />

    return (
        <div>
            <ul className="visualization-types">
                {
                    Object.keys(VisualizationType).map(tpe => {
                        const vizType = VisualizationType[tpe];
                        const className = (
                            visualizationType === vizType
                            ? 'visualization-types__active-type'
                            : null
                        )
                        return (
                            <li key={vizType} className={className}>
                            <a onClick={() => this.setState({ visualizationType: vizType })}>
                                {vizType}
                            </a>
                            </li>
                        )
                    })
                }
            </ul>
            {viz}
        </div>
    )
  }
}

const examples = [
    "PersonX starts to yell at PersonY",
    "PersonX drops a hint",
    "PersonX reports ___ to the police",
    "PersonX drinks a cup of coffee",
    "PersonX carries out PersonX's threat",
    "It starts snowing",
  ].map(source => ({source}))


const apiUrl = () => `${API_ROOT}/predict/event2mind`

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
