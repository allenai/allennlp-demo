import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { ThemeProvider } from '@allenai/varnish/theme';
import { Header, ExternalLink } from '@allenai/varnish/components';

import { API_ROOT } from './api-config';
import { Menu } from './components/Menu';
import ModelIntro from './components/ModelIntro';
import { modelComponents } from './models'
import { PaneTop } from './components/Pane';
import WaitingForPermalink from './components/WaitingForPermalink';

import './css/App.css';
import './css/fonts.css';
import './css/icons.css';
import './css/Accordion.css';
import './css/hierplane-overrides.css';
import './css/visualization-types.css';


/*******************************************************************************
  <App /> Container
*******************************************************************************/

const DEFAULT_PATH = "/reading-comprehension"

// The App is just a react-router wrapped around the Demo component.
const App = () => (
  <ThemeProvider>
    <Router>
        <BlockOverflow>
          <Switch>
            <Route exact path="/" render={() => (
              <Redirect to={DEFAULT_PATH}/>
            )}/>
            <Route path="/nochrome/:model/:slug?"
                   render={(routeProps) => <Demo {...routeProps}/>}/>
            <Route path="/:model/:slug?" component={DemoChrome}/>
          </Switch>
        </BlockOverflow>
    </Router>
  </ThemeProvider>
)

const DemoChrome = (props) => {
  const [requestData, setRequestData] = useState(null)
  const [responseData, setResponseData] = useState(null)

  const clearData = () => {
    setRequestData(null)
    setResponseData(null)
  }

  const updateData = (requestData, responseData) => {
    setRequestData(requestData)
    setResponseData(responseData)
  }

  const { model } = props.match.params

  return (
    <React.Fragment>
      <Header alwaysVisible={true} />
      <div className="pane-container">
        <Menu selectedModel={model} clearData={clearData}/>
        <Demo {...props} requestData={requestData} responseData={responseData} updateData={updateData}/>
      </div>
    </React.Fragment>
  )
}

class Demo extends React.Component {
  constructor(props) {
    super(props);

    // React router supplies us with a model name and (possibly) a slug.
    const { model, slug } = props.match.params

    this.state = {
      slug,
      selectedModel: model
    }
  }

  // We also need to update the state whenever we receive new props from React router.
  componentWillReceiveProps({ match }) {
    const { model, slug } = match.params;
    this.setState({selectedModel: model, slug: slug});
  }

  // After the component mounts, we check if we need to fetch the data
  // for a permalink.
  componentDidMount() {
    const { slug, responseData } = this.state;

    // If this is a permalink and we don't yet have the data for it...
    if (slug && !responseData) {
      // Make an ajax call to get the permadata,
      // and then use it to update the state.
      fetch(`${API_ROOT}/permadata`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"slug": slug})
      }).then(function(response) {
        return response.json();
      }).then((json) => {
        const { requestData, responseData } = json;
        this.props.updateData({requestData, responseData});
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }
  }

  render() {
    const { slug, selectedModel } = this.state;
    const { requestData, responseData, updateData } = this.props

    const ModelComponent = () => {
      if (slug && !responseData) {
        // We're still waiting for permalink data, so just return the placeholder component.
        return (<WaitingForPermalink/>)
      } else if (modelComponents[selectedModel]) {
          // This is a model we know the component for, so render it.
          return React.createElement(modelComponents[selectedModel], {requestData, responseData, selectedModel, updateData})
      } else if (selectedModel === "user-models") {
        const modelRequest = "User Contributed Models"
        const modelDescription = (
          <span>
            <span>
              AllenNLP is looking to add contributed models implemented using AllenNLP as either library components or demos (with free hosting!).
              If you have a published result or novel model demonstrating strong performance on a dataset and you are interested
              in adding your model to a list of publically available implementations, as a service to this demo, or as a component in the library itself,
              please consider opening an issue on our
            </span>
            <ExternalLink href="https://github.com/allenai/allennlp/issues" target="_blank" rel="noopener">{' '} public Github repository </ExternalLink>
            <span>
              or sending us an email at allennlp-contact@allenai.org to discuss what you have in mind.
            </span>
          </span>
        );

        return (
          <div className="model model__content">
            <div className='model__content'>
              <PaneTop>
                <ModelIntro title={modelRequest} description={modelDescription}/>
              </PaneTop>
            </div>
          </div>
        )
      }
    }

    return <ModelComponent/>
  }
}

const BlockOverflow = styled.div`
  overflow-y: hidden;
`;

export default App;
