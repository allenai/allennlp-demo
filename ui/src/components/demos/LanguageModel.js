import React from 'react'
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';
import { Collapse } from '@allenai/varnish';

import OutputField from '../OutputField'
import SaliencyMaps from '../Saliency'
import HotflipComponent, { HotflipPanel } from '../Hotflip'
import { FormField, FormLabel, FormTextArea } from '../Form';
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  HOTFLIP_ATTACKER
} from '../InterpretConstants'

const apiUrl = () => `/api/next-token-lm/predict`
const apiUrlInterpret = (_, interpreter) => `/api/next-token-lm/interpret/${interpreter}`;
const apiUrlAttack = (_, attacker) => `/api/next-token-lm/attack/${attacker}`

const NAME_OF_INPUT_TO_ATTACK = "tokens"
const NAME_OF_GRAD_INPUT = "grad_input_1"
const title = "Language Modeling";

const Wrapper = styled.div`
  color: #232323;
  flex-grow: 1;
  font-size: 1em;
  background: ${({theme}) => theme.palette.background.light};
  overflow: scroll;

  @media(max-width: 500px) {
    margin: 0;
  }
`

const ModelArea = styled.div`
  background: ${({theme}) => theme.palette.common.white};
`

const Loading = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.8em;
  color: #8c9296;
`

const Error = styled(Loading)`
  color: red;
`

const LoadingText = styled.div`
  padding-left: ${({theme}) => theme.spacing.xs};
`

const InputOutput = styled.div`
  display: flex;
  margin-top: ${({theme}) => theme.spacing.sm};

  @media(max-width: 500px) {
    display: block;
  }
`

const InputOutputColumn = styled(FormField)`
  flex: 1 1 50%;

  :first-child {
    padding-right: ${({theme}) => theme.spacing.md};
  }

  :last-child {
    padding-left: ${({theme}) => theme.spacing.md};
  }

  @media(max-width: 500px) {
    :first-child,
    :last-child {
      padding: 0;
    }

    :first-child {
      padding: ${({theme}) => `0 0 ${theme.spacing.md}`};
    }
  }
`

const TextInput = styled(FormTextArea)`
  display: block;
  width: 100%;
  font-size: 1.25em;
  min-height: 100px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: ${({theme}) => theme.spacing.md};
`

const ListItem = styled.li`
  margin: ${({theme}) => `0 0 ${theme.spacing.xs}`};
`

const ChoiceList = styled.ul`
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  list-style-type: none;
`

const ChoiceItem = styled.button`
  color: #2085bc;
  cursor: pointer;
  background: transparent;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  font-size: 1.15em;
  border: none;
  border-bottom: ${({theme}) => `2px solid ${theme.palette.common.transparent}`};
`

const UndoButton = styled(ChoiceItem)`
  color: #8c9296;
  margin-bottom: ${({theme}) => theme.spacing.xl};
`

const Probability = styled.span`
  color: #8c9296;
  margin-right: ${({theme}) => theme.spacing.xs};
  font-size: 0.8em;
  min-width: 4em;
  text-align: right;
`

const Token = styled.span`
  font-weight: 600;
`

const DEFAULT = "AllenNLP is";

function addToUrl(output, choice) {
  if ('history' in window) {
    window.history.pushState(null, null, '?text=' + encodeURIComponent(output + (choice || '')))
  }
}

function loadFromUrl() {
  const params =
      document.location.search.substr(1).split('&').map(p => p.split('='));
  const text = params.find(p => p[0] === 'text');
  return Array.isArray(text) && text.length === 2 ?  decodeURIComponent(text.pop()) : null;
}

function trimRight(str) {
  return str.replace(/ +$/, '');
}

const DEFAULT_MODEL = "345M"

const description = (
  <span>
<p>Language modeling is the task of determining the probability of a given sequence of words occurring in a sentence. </p>
<p>This demonstration uses the public 345M parameter <a href="https://github.com/openai/gpt-2" target="_blank" rel="noopener noreferrer">OpenAI GPT-2</a> language model
to generate sentences.<br /><br />
Provide some initial text, and the model will generate a list of candidates for the next few words
using <a href="https://api.semanticscholar.org/CorpusID:76662039" target="_blank" rel="noopener noreferrer">Stochastic Beam Search</a>.
You can click on one of those candidate to choose it and continue, or you can keep typing.
Click the left arrow at the bottom to undo your last choice.</p>
  </span>
)

const probabilitiesNote = (
  <span>
<p> Note: The prediction percentages are normalized across these five sequences. The true probabilities are lower.</p>
  </span>
)

const getGradData = ({ grad_input_1 }) => {
  return [grad_input_1];
}

const cleanTokensForDisplay = (tokens) => {
  // For GPT-2.  GPT-2 uses special characters inside its token dictionary to denote different
  // kinds of whitespace (e.g., 'Ġ' is prepended to a token when there is a space before it).  This
  // code re-formats the tokens for display, adding back spaces, putting in wordpiece separator
  // symbols when necessary, and replacing newline characters with a return symbol.
  return tokens.map((token, index) => {
    token = token.replace(/Ċ/g, "↵");
    if (token[0] === 'Ġ') {
      return token.replace(/Ġ/g, " ");
    } else if (index !== 0 && token !== "↵") {
      return '##' + token;
    } else {
      return token;
    }
  });
}

const MySaliencyMaps = ({interpretData, tokens, interpretModel, requestData}) => {
  let simpleGradData = undefined;
  let integratedGradData = undefined;
  let smoothGradData = undefined;
  if (interpretData) {
    simpleGradData = GRAD_INTERPRETER in interpretData ? getGradData(interpretData[GRAD_INTERPRETER]['instance_1']) : undefined
    integratedGradData = IG_INTERPRETER in interpretData ? getGradData(interpretData[IG_INTERPRETER]['instance_1']) : undefined
    smoothGradData = SG_INTERPRETER in interpretData ? getGradData(interpretData[SG_INTERPRETER]['instance_1']) : undefined
  }
  const inputTokens = [cleanTokensForDisplay(tokens)];
  const inputHeaders = [<p><strong>Sentence:</strong></p>];
  const allInterpretData = {simple: simpleGradData, ig: integratedGradData, sg: smoothGradData};
  return <SaliencyMaps interpretData={allInterpretData} inputTokens={inputTokens} inputHeaders={inputHeaders} interpretModel={interpretModel} requestData={requestData} />
}

const Attacks = ({attackData, attackModel, requestData}) => {
  let hotflipData = undefined;
  if (attackData && attackData.hotflip) {
    hotflipData = attackData["hotflip"];
    hotflipData["new_prediction"] = cleanTokensForDisplay([hotflipData["outputs"]["top_tokens"][0][0]])[0];
    hotflipData["original"] = cleanTokensForDisplay(hotflipData["original"]);
    hotflipData["final"][0] = cleanTokensForDisplay(hotflipData["final"][0]);
  }
  return (
    <OutputField label="Model Attacks">
      <Collapse>
        <HotflipPanel>
          <HotflipComponent hotflipData={hotflipData} hotflipFunction={attackModel(requestData, HOTFLIP_ATTACKER, NAME_OF_INPUT_TO_ATTACK, NAME_OF_GRAD_INPUT)} />
        </HotflipPanel>
      </Collapse>
    </OutputField>
  )
}

class App extends React.Component {

  constructor(props) {
    super(props)

    this.currentRequestId = 0;

    this.state = {
      output: loadFromUrl() || DEFAULT,
      top_tokens: null,
      logits: null,
      probabilities: null,
      loading: false,
      error: false,
      model: DEFAULT_MODEL,
      interpretData: null,
      attackData: null
    }

    this.choose = this.choose.bind(this)
    this.debouncedChoose = _.debounce(this.choose, 1000)
    this.setOutput = this.setOutput.bind(this)
    this.runOnEnter = this.runOnEnter.bind(this)
    this.interpretModel = this.interpretModel.bind(this)
    this.attackModel = this.attackModel.bind(this)
  }

  setOutput(evt) {
    const value = evt.target.value
    if (value) { // TODO(michaels): I shouldn't need to do this
      const trimmed = trimRight(value);

      const loading = trimmed.length > 0;

      this.setState({
          output: value,
          top_tokens: null,
          logits: null,
          probabilities: null,
          interpretData: null,
          attackData: null,
          loading: loading
      })

      this.debouncedChoose()
    }
    else { // Update text input without request to backend server
      this.setState({
          output: value,
          top_tokens: null,
          logits: null,
          probabilities: null,
          interpretData: null,
          attackData: null,
          loading: false
      })
    }
  }

  createRequestId() {
    const nextReqId = this.currentRequestId + 1;
    this.currentRequestId = nextReqId;
    return nextReqId;
  }

  componentDidMount() {
    this.choose()
    if ('history' in window) {
      window.addEventListener('popstate', () => {
        const fullText = loadFromUrl();
        const doNotChangeUrl = fullText ? true : false;
        const output = fullText || DEFAULT;
        this.setState({
          output,
          loading: true,
          top_tokens: null,
          logits: null,
          probabilities: null,
          model: this.state.model
        }, () => this.choose(undefined, doNotChangeUrl));
      })
    }
  }

  choose(choice = undefined, doNotChangeUrl) {
    // strip trailing spaces
    const textAreaText = this.state.output;
    if (trimRight(textAreaText).length === 0) {
      this.setState({ loading: false });
      return;
    }

    this.setState({ loading: true, error: false })
    // TODO(mattg): this doesn't actually send the newline token to the model in the right way.
    // I'm not sure how to fix that.
    const cleanedChoice = choice === undefined ? undefined : choice.replace(/↵/g, '\n');

    const sentence = choice === undefined ? textAreaText : textAreaText + cleanedChoice
    const payload = {
      sentence: sentence
    }

    const currentReqId = this.createRequestId();

    if ('history' in window && !doNotChangeUrl) {
      addToUrl(this.state.output, cleanedChoice);
    }

    fetch(apiUrl(), {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (this.currentRequestId === currentReqId) {
        // If the user entered text by typing don't overwrite it, as that feels
        // weird. If they clicked it overwrite it
        const output = choice === undefined ? this.state.output : data.output
        this.setState({...data, output: sentence, loading: false})
        this.requestData = output;
      }
    })
    .catch(err => {
      console.error('Error trying to communicate with the API:', err);
      this.setState({ error: true, loading: false });
    });
  }

  // Temporarily (?) disabled
  runOnEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        this.choose()
    }
  }

  render() {

    let requestData = {"sentence": this.state.output};
    let interpretData = this.state.interpretData;
    let attackData = this.state.attackData;
    let tokens = [];
    if (this.state.tokens === undefined) {
        tokens = [];
    }
    else {
        if (Array.isArray(this.state.tokens[0])) {
            tokens = this.state.tokens[0];
        }
        else {
            tokens = this.state.tokens;
        }
    }
    return (
      <Wrapper classname="model">
        <ModelArea className="model__content answer">
          <h2><span>{title}</span></h2>
          <p><span>{description}</span></p>

          <InputOutput>
            <InputOutputColumn>
              <FormLabel>Sentence:</FormLabel>
                <TextInput type="text"
                          autoSize={{ minRows: 5, maxRows: 10 }}
                          value={this.state.output}
                          onChange={this.setOutput}/>
                {this.state.loading ? (
                  <Loading>
                    <img src="/assets/loading-bars.svg" width="25" height="25" alt="loading" />
                    <LoadingText>Loading</LoadingText>
                  </Loading>
                ) : null}
                {this.state.error ? (
                  <Error>
                    <span role="img" aria-label="warning">️⚠</span> Something went wrong. Please try again.
                  </Error>
                ) : null}
            </InputOutputColumn>
            <InputOutputColumn>
              <FormLabel>Predictions:</FormLabel>
              <Choices output={this.state.output}
                      index={0}
                      choose={this.choose}
                      logits={this.state.logits}
                      top_tokens={this.state.top_tokens}
                      probabilities={this.state.probabilities}
                      hidden={this.state.loading}/>
            </InputOutputColumn>
          </InputOutput>
          <p><span>{probabilitiesNote}</span></p>
        </ModelArea>
        <div hidden className="model__content">
          <MySaliencyMaps interpretData={interpretData} tokens={tokens} interpretModel={this.interpretModel} requestData={requestData}/>
          <Attacks attackData={attackData} attackModel={this.attackModel} requestData={requestData}/>
        </div>
      </Wrapper>
    )
  }

  interpretModel = (inputs, interpreter) => () => {
    return fetch(apiUrlInterpret(inputs, interpreter), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...inputs, ...{interpreter}})
    }).then((response) => {
      return response.json();
    }).then((json) => {
      const stateUpdate = { ...this.state }
      stateUpdate['interpretData'] = {...stateUpdate['interpretData'], [interpreter]: json}
      this.setState(stateUpdate)
    })
  }

  attackModel = (inputs, attacker, inputToAttack, gradInput) => ({target}) => {
    const requestBody = {
      inputs: inputs,
      input_field_to_attack: inputToAttack,
      grad_input_field: gradInput
    };
    if (target !== undefined) {
      requestBody.target = {top_tokens: [[target]]}
    }

    return fetch(apiUrlAttack(inputs, attacker), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }).then((response) => {
      return response.json();
    }).then((json) => {
      const stateUpdate = { ...this.state }
      stateUpdate['attackData'] = {...stateUpdate['attackData'], [attacker]: json}
      this.setState(stateUpdate)
    })
  }
}


const formatProbability = (probs, idx) => {
  // normalize the displayed probabilities
  var sum = probs.reduce(function(a, b){
    return a + b;
  }, 0);
  var prob = probs[idx] / sum
  prob = prob * 100
  return `${prob.toFixed(1)}%`
}

const Choices = ({output, index, logits, top_tokens, choose, probabilities}) => {
  if (!top_tokens) { return null }
  if (top_tokens.length <= index) { return null }
  if (probabilities.length <= index) { return null }

  const lis = top_tokens.map((word, idx) => {
    const prob = formatProbability(probabilities, idx)

    // get rid of CRs
    const cleanWord = word.join('').replace(' ,', ',').replace(/\n/g, "↵")
        .replace(/Ġ/g, " ").replace(/Ċ/g, "↵")

    const displaySeq = cleanWord.slice(-1) == "." ? cleanWord : cleanWord.concat(' ...')

    return (
      <ListItem key={`${idx}-${cleanWord}`}>
        <ChoiceItem onClick={() => choose(cleanWord)}>
          <Probability>{prob}</Probability>
          {' '}
          <Token>{displaySeq}</Token>
        </ChoiceItem>
      </ListItem>
    )
  })

  const goBack = () => {
    window.history.back();
  }

  const goBackItem = (
    <ListItem key="go-back">
      {'history' in window ? (
        <UndoButton onClick={goBack}>
          <Probability>←</Probability>
          {' '}
          <Token>Undo</Token>
        </UndoButton>
      ) : null}
    </ListItem>
  )

  return (
    <ChoiceList>
      {lis}
      {goBackItem}
    </ChoiceList>
  )
}

const modelProps = {}

export default withRouter(props => <App {...props} {...modelProps}/>)
