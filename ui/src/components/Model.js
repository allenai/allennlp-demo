import React from 'react'
import styled, { createGlobalStyle } from 'styled-components';

import { PaneTop, PaneBottom } from './Pane'
import ModelIntro from './ModelIntro';
import DemoInput from './DemoInput'
import { Tabs } from 'antd';
import qs from 'querystring';

/**
 * Returns whether the provided URL targets the legacy model serving mechanism.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isLegacyModelEndpoint(url) {
  const u = new URL(url, window.location.origin);
  return !u.pathname.startsWith('/api/');
}


class Model extends React.Component {
    constructor(props) {
      super(props);

      const { requestData, responseData, interpretData, attackData } = props;

      this.state = {
        outputState: responseData ? "received" : "empty", // valid values: "working", "empty", "received", "error"
        requestData: requestData,
        responseData: responseData,
        interpretData: interpretData,
        attackData: attackData
      };

      this.runModel = this.runModel.bind(this)
      this.interpretModel = this.interpretModel.bind(this)
      this.attackModel = this.attackModel.bind(this)
    }

    runModel(inputs, disablePermadata = false) {
      const { selectedModel, apiUrl } = this.props

      this.setState({outputState: "working", interpretData: undefined, attackData: undefined});

      // If we're not supposed to generate a new permalink, add the `record=false` query string
      // argument.
      let url;
      if (disablePermadata) {
        const u = new URL(apiUrl(inputs), window.location.origin);
        const queryString = { ...qs.parse(u.search), record: false };
        u.search = qs.stringify(queryString);
        url = u.toString();
      } else {
        url = apiUrl(inputs);
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {
        if (response.status !== 200) {
            throw Error('Predict call failed.');
        }
        return response.json();
      }).then((json) => {
        this.props.updateData(inputs, json)
        this.setState({outputState: "received"})

        if (!disablePermadata) {
          // Put together the appropriate request body.
          let requestBody;
          if (isLegacyModelEndpoint(url)) {
            // Extract the model name from the URL by taking the last portion
            // of the path. The model name in this respect is the key in
            // `models.json` that corresponds to the model being invoked. It
            // may include the task name and model name, or one or the other.
            //
            // In the near future we plan to stop storing and relying on this
            // field at all, which makes this an acceptable workaround.
            const u = new URL(url, window.location.origin);
            const modelName = u.pathname.split('/').pop();
            requestBody = JSON.stringify({
              model_name: modelName,
              request_data: inputs
            })
          } else {
            // New endpoints are always of the form `/api/:model_id/:action`.
            const u = new URL(url, window.location.origin);
            const modelId = u.pathname.split('/')[2];
            if (!modelId) {
              throw new Error(`Malformed model endpoint url: ${url}`);
            }
            requestBody = JSON.stringify({
              // TODO: `selectedModel` is a misnomer, it's actually the task name. We should fix
              // this.
              task_name: selectedModel,
              model_id: modelId,
              request_data: inputs
            });
          }

          fetch(`/api/permalink/`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: requestBody
          }).then(r => r.json()).then(slug => {
            const newPath = `/${selectedModel}/${slug}`;
            this.props.history.push(newPath);
          });
        }
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }

    interpretModel = (inputs, interpreter) => () => {
      const { apiUrlInterpret } = this.props
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
      const attackInputs = {...{attacker}, ...{inputToAttack}, ...{gradInput}}
      if (target !== undefined) {
        attackInputs['target'] = target
      }
      const { apiUrlAttack } = this.props
      const url = apiUrlAttack(inputs, attacker)

      // Prepare the request body. The new `/attack` endpoints expect a slightly different
      // request body.
      const requestBody =
        isLegacyModelEndpoint(url)
          ? { ...inputs, ...attackInputs }
          : { inputs: inputs, input_field_to_attack: inputToAttack, grad_input_field: gradInput };

      return fetch(url, {
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

    componentDidMount() {
      if (this.state.requestData && !this.state.responseData) {
        this.runModel(this.state.requestData, true);
      }
    }

    render() {
        const { title, description, descriptionEllipsed, examples, fields, selectedModel, Output, requestData, responseData, usage } = this.props;
        const { outputState } = this.state;

        const demoInput = <DemoInput selectedModel={selectedModel}
                                     examples={examples}
                                     fields={fields}
                                     inputState={requestData}
                                     responseData={responseData}
                                     outputState={outputState}
                                     runModel={this.runModel}/>

        const outputProps = {...this.state, requestData, responseData}
        const demoOutput = requestData && responseData ? <Output {...outputProps} interpretModel={this.interpretModel} attackModel={this.attackModel}/> : null

        const tabs = [ demoInput, usage ].filter(tabContent => tabContent !== undefined);

        return (
            <Wrapper className="pane__horizontal model">
                <TabFontFix />
                <PaneTop>
                  <div className="model__content">
                    <ModelIntro
                      title={title}
                      description={description}
                      descriptionEllipsed={descriptionEllipsed}/>
                    {tabs.length > 1 ? (
                      <Tabs defaultActiveKey="demo" animated={false}>
                        <Tabs.TabPane tab="Demo" key="demo">
                          {demoInput}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Usage" key="usage">
                          {usage}
                        </Tabs.TabPane>
                      </Tabs>
                    ) : demoInput}
                  </div>
                </PaneTop>
                <PaneBottom outputState={outputState}>{demoOutput}</PaneBottom>
            </Wrapper>
        )
    }
}

const TabFontFix = createGlobalStyle`
  .ant-tabs,
  .ant-tabs-nav-container {
    font-size: inherit !important;
  }
`;

export const Wrapper = styled.div`
  background: ${({theme}) => theme.palette.background.light};
  display: block;
  width: 100%;
`;

export default Model
