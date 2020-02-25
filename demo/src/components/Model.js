import React from 'react'
import styled, { createGlobalStyle } from 'styled-components';

import { PaneTop, PaneBottom } from './Pane'
import ModelIntro from './ModelIntro';
import DemoInput from './DemoInput'
import { Tabs } from 'antd';

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

    runModel(inputs) {
      const { selectedModel, apiUrl } = this.props

      this.setState({outputState: "working", interpretData: undefined, attackData: undefined});

      fetch(apiUrl(inputs), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {
        return response.json();
      }).then((json) => {
        // If the response contains a `slug` for a permalink, we want to redirect
        // to the corresponding path using `history.push`.
        const { slug } = json;
        const newPath = slug ? `/${selectedModel}/${slug}` : `/${selectedModel}`

        // We'll pass the request and response data along as part of the location object
        // so that the `Demo` component can use them to re-render.
        const location = {
          pathname: newPath
        }

        this.props.updateData(inputs, json)
        //
        // requestData, responseData

        if (window.frameElement) {
          // Based on http://www.awongcm.io/blog/2018/11/25/using-iframes-api-to-toggle-client-side-routing-of-react-router-for-legacy-web-apps/
          window.frameElement.ownerDocument.defaultView.history.pushState({}, '', newPath)
        } else {
          // This is not in an iframe, so just push the location
          this.props.history.push(location)
        }

        this.setState({outputState: "received"})

      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }

    interpretModel = (inputs, interpreter) => () => {
      const { apiUrlInterpret } = this.props
      return fetch(apiUrlInterpret(inputs), {
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
      return fetch(apiUrlAttack(inputs), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...inputs, ...attackInputs})
      }).then((response) => {
        return response.json();
      }).then((json) => {
        const stateUpdate = { ...this.state }
        stateUpdate['attackData'] = {...stateUpdate['attackData'], [attacker]: json}
        this.setState(stateUpdate)
      })
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
