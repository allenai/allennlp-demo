import React from 'react'
import { PaneLeft, PaneRight, PaneTop, PaneBottom } from './Pane'
import DemoInput from './DemoInput'

class Model extends React.Component {
    constructor(props) {
      super(props);

      const { requestData, responseData, interpretData, inputReductionData, hotflipData } = props;

      this.state = {
        outputState: responseData ? "received" : "empty", // valid values: "working", "empty", "received", "error"
        requestData: requestData,
        responseData: responseData,
        interpretData: interpretData,
        inputReductionData: inputReductionData,
        hotflipData: hotflipData
      };

      this.runModel = this.runModel.bind(this)
      this.interpretModel = this.interpretModel.bind(this)
      this.reduceInput = this.reduceInput.bind(this)
      this.hotflipInput = this.hotflipInput.bind(this)
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
        let stateUpdate = Object.assign({}, this.state)
        stateUpdate['interpretData'] = Object.assign({}, { [interpreter]: json }, stateUpdate['interpretData'])
        this.setState(stateUpdate)
      })
    }

    reduceInput(inputs) {
      const { selectedModel, inputReductionUrl } = this.props

      fetch(inputReductionUrl(inputs), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {
        return response.json();
      }).then((json) => {        
        this.setState({inputReductionData: json})
      });
    }
    hotflipInput(inputs) {
      const { selectedModel, hotflipUrl } = this.props
      fetch(hotflipUrl(inputs), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
      }).then((response) => {        
        return response.json();
      }).then((json) => {        
        this.setState({hotflipData: json})
      });
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

        const demoOutput = requestData && responseData ? <Output {...this.state} interpretModel={this.interpretModel} reduceInput={this.reduceInput} hotflipInput={this.hotflipInput}/> : null
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
