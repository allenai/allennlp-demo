import React from 'react'
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';

const Wrapper = styled.div`
  color: #232323;
  flex-grow: 1;
  font-size: 1em;

  @media(max-width: 500px) {
    margin: 0;
  }
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
  padding-left: 0.5rem;
`

const InputOutput = styled.div`
  display: flex;
  margin-top: 10px;

  @media(max-width: 500px) {
    display: block;
  }
`

const InputOutputColumn = styled.div`
  flex: 1 1 50%;

  :first-child {
    padding-right: 1rem;
  }

  :last-child {
    padding-left: 1rem;
  }

  @media(max-width: 500px) {
    :first-child,
    :last-child {
      padding: 0;
    }

    :first-child {
      padding: 0 0 1rem;
    }
  }
`

const TextInput = styled.textarea`
  display: block;
  width: 100%;
  font-size: 1.25em;
  min-height: 100px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 1rem;
`

const ListItem = styled.li`
  margin: 0 0 0.5rem;
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
  border-bottom: 2px solid transparent;
`

const UndoButton = styled(ChoiceItem)`
  color: #8c9296;
`

const Probability = styled.span`
  color: #8c9296;
  margin-right: 0.5rem;
  font-size: 0.8em;
  min-width: 4em;
  text-align: right;
`

const Token = styled.span`
  font-weight: 600;
`

const Footer = styled.div`
  margin: 2rem 0 0 0;
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
This demonstration uses the public 345M 
parameter <a href="https://github.com/openai/gpt-2" target="_blank" rel="noopener noreferrer">OpenAI GPT-2</a> language model 
to generate sentences.  The model implementation is provided by Hugging Face’s 
<a href="https://github.com/huggingface/pytorch-pretrained-BERT" target="_blank" rel="noopener noreferrer">pytorch-pretrained-BERT</a> 
library.

Enter some initial text and the model will generate the most likely next words.
You can click on one of those words to choose it and continue or just keep typing.
Click the left arrow at the bottom to undo your last choice.
  </span>
)

class App extends React.Component {

  constructor(props) {
    super(props)

    this.currentRequestId = 0;

    this.state = {
      output: loadFromUrl() || DEFAULT,
      words: null,
      logits: null,
      probabilities: null,
      loading: false,
      error: false,
      model: DEFAULT_MODEL
    }

    this.choose = this.choose.bind(this)
    this.debouncedChoose = _.debounce(this.choose, 1000)
    this.setOutput = this.setOutput.bind(this)
    this.runOnEnter = this.runOnEnter.bind(this)
  }

  setOutput(evt) {
    const value = evt.target.value
    const trimmed = trimRight(value);

    this.setState({
        output: value,
        words: null,
        logits: null,
        probabilities: null,
        loading: trimmed.length > 0
    })
    this.debouncedChoose()
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
    this.setState({ loading: true, error: false })

    // strip trailing spaces
    const trimmedOutput = trimRight(this.state.output);
    if (trimmedOutput.length === 0) {
      this.setState({ loading: false });
      return;
    }

    const payload = {
      previous: trimmedOutput,
      next: choice,
      numsteps: 5,
      model_name: this.state.model
    }

    const currentReqId = this.createRequestId();
    const endpoint = `${API_ROOT}/predict/gpt2`

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

    return (
      <Wrapper className="model">
        <div className="model__content answer">
        <h2><span>Language Modeling</span></h2>
        <p><span>{description}</span></p>

        <InputOutput>
          <InputOutputColumn className="form__field">
            <label>Sentence:</label>
              <TextInput type="text"
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
          <InputOutputColumn className="form__field">
            <label>Options:</label>
            <Choices output={this.state.output}
                     choose={this.choose}
                     logits={this.state.logits}
                     words={this.state.words}
                     probabilities={this.state.probabilities}
                     hidden={this.state.loading}/>
          </InputOutputColumn>
        </InputOutput>
      </div>
      </Wrapper>
    )
  }
}


const formatProbability = prob => {
  prob = prob * 100
  return `${prob.toFixed(1)}%`
}

const Choices = ({output, logits, words, choose, probabilities}) => {
  if (!words) { return null }

  const lis = words.map((word, idx) => {
    const prob = formatProbability(probabilities[idx])

    // get rid of CRs
    const cleanWord = word.replace(/\n/g, "↵")

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

const modelProps = {}

export default withRouter(props => <App {...props} {...modelProps}/>)
