import React from 'react'
import { PaneLeft, PaneRight, PaneTop, PaneBottom } from './Pane'
import DemoInput from './DemoInput'

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

      this.setState({outputState: "working"});

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
          pathname: newPath,
          state: { requestData: inputs, responseData: json }
        }
        this.props.history.push(location);
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }

    interpretModel(inputs, interpreter) {
      const { apiUrlInterpret } = this.props
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
        const stateUpdate = { ...this.state }
        stateUpdate['interpretData'] = Object.assign({}, { [interpreter]: json }, stateUpdate['interpretData'])
        this.setState(stateUpdate)
      })
    }

    attackModel(inputs, attacker, name_of_input_to_attack, name_of_grad_input) {
      const { apiUrlAttack } = this.props
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
        const stateUpdate = { ...this.state }
        stateUpdate['attackData'] = Object.assign({}, { [attacker]: json }, stateUpdate['attackData'])
        this.setState(stateUpdate)
      })
    }

 render() {
        const { title, description, descriptionEllipsed, examples, fields, selectedModel, vertical, Output } = this.props;
        const { requestData, responseData, outputState } = this.state;
        const demoInput = <DemoInput selectedModel={selectedModel}
                                     title={title}
                                     description={description}
                                     descriptionEllipsed={descriptionEllipsed}
                                     examples={examples}
                                     fields={fields}
                                     inputState={requestData}
                                     responseData={responseData}
                                     outputState={outputState}
                                     runModel={this.runModel}/>

        const demoOutput = requestData && responseData ? <Output {...this.state} interpretModel={this.interpretModel} attackModel={this.attackModel}/> : null
        let className, InputPane, OutputPane
        if (vertical) {
          className = "pane model"
          InputPane = PaneLeft
          OutputPane = PaneRight
        } else {
          className = "pane__horizontal model"
          InputPane = PaneTop
          OutputPane = PaneBottom
        }

        return (
            <div className={className}>
                <InputPane>{demoInput}</InputPane>
                <OutputPane outputState={outputState}>{demoOutput}</OutputPane>
            </div>
        )
    }
}

export default Model
