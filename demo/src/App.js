import React from 'react';
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

/*
The App is just a react-router wrapped around the Demo component.
The design is a bit convoluted so that the same code can run
the overall demo frontend or an individual model demo.
Here's how it accomplishes that:

If you request `/` (corresponding to https://demo.allennlp.org), you will get
redirected to the default model (here, /reading-comprehension).

The overall front-end service serves all routes that look like `/<model_name>`.
When you request `/<model_name>`, you will be served the <Demo> component,
which shows some chrome, a menu, and a <SingleTaskFrame> that's an iframe with src
`/task/<model_name>`, which the k8s ingress controller will direct to the machine
serving that specific demo. That machine may be doing *anything*, as long as it serves
its demo front-end at `/task/<model_name>`.

In particular, that machine may be also running this code,
for which the route `/task/<model_name>` serves the <SingleTaskDemo> component,
which delegates to the particular ModelComponent specified in `demo/src/models.js`.
*/
const App = () => (
  <ThemeProvider>
    <Router>
        <BlockOverflow>
          <Switch>
            <Route exact path="/" render={() => (
              <Redirect to={DEFAULT_PATH}/>
            )}/>
            <Route path="/task/:model/:slug?" component={SingleTaskDemo}/>
            <Route path="/:model/:slug?" component={Demo}/>
          </Switch>
        </BlockOverflow>
    </Router>
  </ThemeProvider>
)

// This is the top-level demo component.
// It handles the chrome for header and menus,
// and it renders the specific task in an iframe.
const Demo = (props) => {
  const { model } = props.match.params

  return (
    <React.Fragment>
      <Header alwaysVisible={true} />
      <div className="pane-container">
        <Menu selectedModel={model} clearData={() => {}}/>
        <SingleTaskFrame {...props}/>
      </div>
    </React.Fragment>
  )
}

// Load the task in an iframe
const SingleTaskFrame = (props) => {
  const { model, slug } = props.match.params
  const { search } = props.location
  const maybeSlug = slug ? `/${slug}` : ''
  const url = `/task/${model}${maybeSlug}${search}`

  return <iframe title={`SingleTaskFrame for ${model}`} src={url} style={{width: "100%", borderWidth: 0}}/>
}


class SingleTaskDemo extends React.Component {
  constructor(props) {
    super(props);

    // React router supplies us with a model name and (possibly) a slug.
    const { model, slug } = props.match.params

    this.state = {
      slug,
      selectedModel: model,
      requestData: null,
      responseData: null
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
    const { model } = this.props.match.params

    // If this is a permalink and we don't yet have the data for it...
    if (slug && !responseData) {
      // Make an ajax call to get the permadata,
      // and then use it to update the state.
      fetch(`${API_ROOT}/permadata/${model}`, {
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
        this.setState({requestData, responseData});
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }
  }

  render() {
    const { slug, selectedModel, requestData, responseData } = this.state;
    const updateData = (requestData, responseData) => this.setState({requestData, responseData})

    if (slug && !responseData) {
      // We're still waiting for permalink data, so just return the placeholder component.
      return (<WaitingForPermalink/>)
    } else if (modelComponents[selectedModel]) {
        // This is a model we know the component for, so render it.
        return React.createElement(modelComponents[selectedModel], {requestData, responseData, selectedModel, updateData})
    } else if (selectedModel === "user-models") {
     const developLocallyHeader = "Developing Locally"
     const developLocallyDescription = (
          <span>
            <span>
              It's possible to run this demo locally with your own model (e.g., to visualize or interpret its predictions). See
            </span>
            <ExternalLink href="https://github.com/allenai/allennlp-demo#contributing-a-new-model-to-the-demo" target="_blank" rel="noopener">{' '} this tutorial </ExternalLink>
            <span>
              for more information.
            </span>
          </span>
       );
      const modelRequest = "User Contributed Models"
      const modelDescription = (
        <span>
          <span>
            We are always looking to add user contributed AllenNLP models as either components in the AllenNLP library or on this demo site.
            If you have a published result or novel model demonstrating strong performance on a dataset and you are interested
            in adding your model to a list of publicly available implementations, as a service to this demo, or as a component in the library itself,
            please openan issue on our
          </span>
          <ExternalLink href="https://github.com/allenai/allennlp/issues" target="_blank" rel="noopener">{' '} public Github repository </ExternalLink>
          <span>
            or sending us an email at allennlp-contact@allenai.org.
          </span>
        </span>

      );

      return (
        <div className="model model__content">
          <div className='model__content'>
            <PullToTop>
              <PaneTop>
                <ModelIntro title={modelRequest} description={modelDescription}/>
                <br />
                <ModelIntro title={developLocallyHeader} description={developLocallyDescription}/>
              </PaneTop>
            </PullToTop>
          </div>
        </div>
      )
    }
  }
}

const PullToTop = styled.div`
  margin-bottom: 100%;
`;

const BlockOverflow = styled.div`
  overflow-y: hidden;
`;

export default App;
