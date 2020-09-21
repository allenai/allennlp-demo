import React from 'react'
import styled from 'styled-components';
import _ from 'lodash';
import { Tabs, Select, Typography } from '@allenai/varnish';
import qs from 'querystring';

import { PaneTop, PaneBottom } from './Pane'
import ModelIntro from './ModelIntro';
import DemoInput from './DemoInput'
import { FormSelect, FormField, FormLabel } from './Form';
import { Usage } from './Usage';

class Model extends React.Component {
    constructor(props) {
      super(props);

      const { requestData, responseData, interpretData, attackData } = props;

      this.state = {
        outputState: responseData ? "received" : "empty", // valid values: "working", "empty", "received", "error"
        requestData: requestData,
        responseData: responseData,
        interpretData: interpretData,
        attackData: attackData,
        selectedSubModel: requestData ? requestData.model : undefined
      };

      this.runModel = this.runModel.bind(this)
      this.interpretModel = this.interpretModel.bind(this)
      this.attackModel = this.attackModel.bind(this)
    }

    runModel(inputs, disablePermadata = false) {
      const { selectedModel, apiUrl } = this.props

      this.setState({outputState: "working", interpretData: undefined, attackData: undefined});

      // replace whatever submodel is in 'model' with 'selectedSubModel'
      const {model, ...restOfTheInputs} = inputs;
      const inputsWithSubModel = {model: this.state.selectedSubModel, ...restOfTheInputs};

      // If we're not supposed to generate a new permalink, add the `record=false` query string
      // argument.
      let url;
      if (disablePermadata) {
        const u = new URL(apiUrl(inputsWithSubModel), window.location.origin);
        const queryString = { ...qs.parse(u.search), record: false };
        u.search = qs.stringify(queryString);
        url = u.toString();
      } else {
        url = apiUrl(inputsWithSubModel);
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputsWithSubModel)
      }).then((response) => {
        if (response.status !== 200) {
            throw Error('Predict call failed.');
        }
        return response.json();
      }).then((json) => {
        this.props.updateData(inputsWithSubModel, json)
        this.setState({outputState: "received"})

        if (!disablePermadata) {
          // Put together the appropriate request body.
          const u = new URL(url, window.location.origin);
          const modelId = u.pathname.split('/')[2];
          if (!modelId) {
            throw new Error(`Malformed model endpoint url: ${url}`);
          }
          const requestBody = JSON.stringify({
            // TODO: `selectedModel` is a misnomer, it's actually the task name. We should fix
            // this.
            task_name: selectedModel,
            model_id: modelId,
            request_data: inputsWithSubModel
          });

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

      // Prepare the request body.
      const requestBody = {
        inputs: inputs,
        input_field_to_attack: inputToAttack,
        grad_input_field: gradInput
      };

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

    handleSubModelChange = (val) => {
      this.setState({selectedSubModel: val});
    }

    render() {
        const { title, description, examples, fields, selectedModel, Output, requestData, responseData, defaultUsage, exampleLabel } = this.props;
        const { outputState } = this.state;

        // pull 'model' field out since we dont want to render it as part of the model inputs
        const [[subModel], fieldsMinusModel] = _.partition(fields, ['name', 'model']);
        const demoInput = <DemoInput selectedModel={selectedModel}
                                     examples={examples}
                                     fields={fieldsMinusModel}
                                     inputState={requestData}
                                     responseData={responseData}
                                     outputState={outputState}
                                     runModel={this.runModel}
                                     exampleLabel={exampleLabel}/>

        const outputProps = {...this.state, requestData, responseData}
        const demoOutput = requestData && responseData ? <Output {...outputProps} interpretModel={this.interpretModel} attackModel={this.attackModel}/> : null

        // grab usage from default or from selected submodel
        let subModelUsage = defaultUsage;
        let subModelDescription = '';
        if(subModel) {
            const selectedSubModel = subModel.options.filter(o => o.modelId === (this.state.selectedSubModel || subModel.options[0].modelId));
            if(selectedSubModel.length) {
              subModelUsage = selectedSubModel[0].usage || defaultUsage;
              subModelDescription =  selectedSubModel[0].desc;
            }
        }

        const tabs = [ demoInput, subModelUsage ].filter(tabContent => tabContent !== undefined);

        return (
            <Wrapper className="pane__horizontal model">
                <PaneTop>
                  <div className="model__content">
                    <ModelIntro
                      title={title}
                      description={description}/>

                    {subModel ?
                      <FormField>
                        <FormLabel>Model</FormLabel>
                        <FormSelect value={this.state.selectedSubModel || subModel.options[0].modelId}
                          onChange={this.handleSubModelChange}
                          dropdownMatchSelectWidth = {false}
                          disabled={outputState === "working"}
                          optionLabelProp="label"
                          listHeight={370}>
                          {
                            subModel.options.map((value) => (
                              <Select.Option key={value.modelId} value={value.modelId} label={value.name}>
                                <>
                                  <Typography.BodyBold>{value.name}</Typography.BodyBold>
                                  <OptDesc>{value.desc}</OptDesc>
                                </>
                              </Select.Option>
                            ))
                          }
                        </FormSelect>
                        <ModelDesc>{subModelDescription}</ModelDesc>
                      </FormField>
                    : null}

                    {tabs.length > 1 ? (
                      <Tabs defaultActiveKey="demo" animated={false}>
                        <Tabs.TabPane tab="Demo" key="demo">
                          {demoInput}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Usage" key="usage">
                          <Usage {...subModelUsage} />
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

const ModelDesc = styled.p`
  margin-bottom: ${({theme}) => theme.spacing.md};
`;

const OptDesc = styled.div`
  max-width: ${({theme}) => theme.breakpoints.md};
  white-space: break-spaces;
`;

export const Wrapper = styled.div`
  background: ${({theme}) => theme.palette.background.light};
  display: block;
  width: 100%;
  max-width: ${({theme}) => theme.breakpoints.xl};
`;

export default Model
