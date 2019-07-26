import React from 'react'
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';
import { Footer, ExternalLink } from '@allenai/varnish/components';

import OutputField from '../OutputField'
import { Accordion } from 'react-accessible-accordion';
import SaliencyComponent from '../Saliency'
import InputReductionComponent from '../InputReduction'
import HotflipComponent from '../Hotflip'
import Model from '../Model'
import { FormField, FormLabel, FormTextArea } from '../Form';
import { API_ROOT } from '../../api-config';
import {
  GRAD_INTERPRETER,
  IG_INTERPRETER,
  SG_INTERPRETER,
  INPUT_REDUCTION_ATTACKER,
  HOTFLIP_ATTACKER
} from '../InterpretConstants'
const apiUrl = () => `${API_ROOT}/predict/next-token-lm`
const apiUrlInterpret = ({interpreter}) => `${API_ROOT}/interpret/next-token-lm/${interpreter}`
const apiUrlAttack = ({attacker, name_of_input_to_attack, name_of_grad_input}) => `${API_ROOT}/attack/next-token-lm/${attacker}/${name_of_input_to_attack}/${name_of_grad_input}`

const NAME_OF_INPUT_TO_ATTACK = "tokens"
const NAME_OF_GRAD_INPUT = "grad_input_1"
const title = "Language Modeling";

const Wrapper = styled.div`
  color: #232323;
  font-size: 1em;
  background: #fff;
  overflow: scroll;
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

const DEFAULT = "Joel is";

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
Enter some initial text and the model will generate the most likely next word.
  </span>
)

class App extends React.Component {

  constructor(props) {
    super(props)

    const { requestData, responseData, interpretData, attackData } = props;
    this.currentRequestId = 0;

    this.state = {
      output: loadFromUrl() || DEFAULT,
      words: null,
      logits: null,
      probabilities: null,
      loading: false,
      error: false,
      model: DEFAULT_MODEL,
      interpretData: interpretData,
      attackData: attackData
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
          words: null,
          logits: null,
          probabilities: null,
          loading: loading
      })

      this.debouncedChoose()
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
          words: null,
          logits: null,
          probabilities: null,
          model: this.state.model
        }, () => this.choose(undefined, doNotChangeUrl));
      })
    }
  }

  choose(choice = undefined, doNotChangeUrl) {
    // strip trailing spaces
    const trimmedOutput = trimRight(this.state.output);
    if (trimmedOutput.length === 0) {
      this.setState({ loading: false });
      return;
    }

    else {
      this.setState({ loading: true, error: false })

      const payload = {
        sentence: trimmedOutput,
        next: choice,
        numsteps: 5,
        model_name: this.state.model
      }

      const currentReqId = this.createRequestId();
      const endpoint = `${API_ROOT}/predict/next-token-lm`

      if ('history' in window && !doNotChangeUrl) {
        addToUrl(this.state.output, choice);
      }

    fetch(endpoint, {
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
        this.setState({...data, output, loading: false})
        this.requestData = output;
        // console.log("data")
        // console.log(data)
      }
    })
    .catch(err => {
      console.error('Error trying to communicate with the API:', err);
      this.setState({ error: true, loading: false });
    });
    }
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

    // const { responseData, requestData, interpretData, interpretModel, attackData, attackModel } = this.props
    var requestData = {"sentence": this.state.output};
    var interpretData = this.state.interpretData;
    var attackData = this.state.attackData;
    // console.log(requestData);
    // console.log(interpretData);
    // console.log(this.props);
    var tokens = [];
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
        console.log(this.state);
    }
    return (
        <Wrapper classname="model">
        <ModelArea className="model__content answer">
          <h2><span>Language Modeling</span></h2>
          <p><span>{description}</span></p>

          <InputOutput>
            <InputOutputColumn>
              <FormLabel>Sentence:</FormLabel>
                <TextInput type="text"
                          autosize={{ minRows: 5, maxRows: 10 }}
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
                      words={this.state.words}
                      probabilities={this.state.probabilities}
                      hidden={this.state.loading}/>
            </InputOutputColumn>
          </InputOutput>
        </ModelArea>
      <Accordion accordion={false}>
          <SaliencyComponent interpretData={interpretData} input1Tokens={tokens}  interpretModel = {this.interpretModel} requestData = {requestData} interpreter={GRAD_INTERPRETER} task={title}/>
          <SaliencyComponent interpretData={interpretData} input1Tokens={tokens}  interpretModel = {this.interpretModel} requestData = {requestData} interpreter={IG_INTERPRETER} task={title}/>
          <SaliencyComponent interpretData={interpretData} input1Tokens={tokens} interpretModel = {this.interpretModel} requestData = {requestData} interpreter={SG_INTERPRETER} task={title}/>
          <HotflipComponent hotflipData={attackData} hotflipInput={this.attackModel} requestDataObject={requestData} task={title} attacker={HOTFLIP_ATTACKER} nameOfInputToAttack={NAME_OF_INPUT_TO_ATTACK} nameOfGradInput={NAME_OF_GRAD_INPUT}/>
      </Accordion>
    </Wrapper>
    )
  }
    
    interpretModel(inputs, interpreter) {
      // const { apiUrlInterpret } = this.props
      // console.log(inputs);
      // console.log(apiUrlInterpret);
      // console.log(interpreter);
      fetch(apiUrlInterpret(Object.assign(inputs, {interpreter})), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {
        return response.json();
      }).then((json) => {
        var stateUpdate = {
            ...this.state,
            interpretData: {
              [interpreter]: json
            }
        };
        this.setState(stateUpdate)
      })
    }

    attackModel(inputs, attacker, name_of_input_to_attack, name_of_grad_input) {
      // const { apiUrlAttack } = this.props
      fetch(apiUrlAttack(Object.assign(inputs, {attacker}, {name_of_input_to_attack}, {name_of_grad_input})), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {
        return response.json();
      }).then((json) => {
        var stateUpdate = {
            ...this.state,
            attackData: {
              [attacker]: json
            }
        };
        this.setState(stateUpdate)
      })
    }
}


const formatProbability = prob => {
  prob = prob * 100
  return `${prob.toFixed(1)}%`
}

const Choices = ({output, index, logits, words, choose, probabilities}) => {
  if (!words) { return null }
  if (words.length <= index) { return null }
  if (probabilities.length <= index) { return null }

  const lis = words[index].map((word, idx) => {
    const prob = formatProbability(probabilities[idx])

    // get rid of CRs
    const cleanWord = word.replace(/\n/g, "↵").replace("/Ġ/g"," ")

    return (
      <ListItem key={`${idx}-${cleanWord}`}>
        <ChoiceItem onClick={() => choose(word)}>
          <Probability>{prob}</Probability>
          {' '}
          <Token>{cleanWord}</Token>
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

const modelProps = {};

export default withRouter(props => <App {...props} {...modelProps}/>)
