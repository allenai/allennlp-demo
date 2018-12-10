import React from 'react'
import { PaneLeft, PaneRight, PaneTop, PaneBottom } from './Pane'
import DemoInput from './DemoInput'

class ModelComponent extends React.Component {
    constructor(props) {
      super(props);

      const { requestData, responseData } = props;

      this.state = {
        outputState: responseData ? "received" : "empty", // valid values: "working", "empty", "received", "error"
        requestData: requestData,
        responseData: responseData
      };

      this.runModel = this.runModel.bind(this)
    }

    runModel(inputs) {
      const { selectedModel, apiUrl } = this.props

      this.setState({outputState: "working"});

      fetch(apiUrl, {
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

    render() {
        const { title, description, examples, fields, selectedModel, horizontal } = this.props;
        const { requestData, responseData } = this.state;

        const demoInput = <DemoInput selectedModel={selectedModel}
                                     title={title}
                                     description={description}
                                     examples={examples}
                                     fields={fields}
                                     inputState={requestData}
                                     outputState={this.state.outputState}
                                     runModel={this.runModel} />

        const demoOutput = requestData && responseData ? this.props.outputComponent({requestData, responseData}) : null

        if (horizontal) {
            return (
                <div className="pane__horizontal model">
                    <PaneTop>
                        {demoInput}
                    </PaneTop>
                    <PaneBottom outputState={this.state.outputState}>
                        {demoOutput}
                    </PaneBottom>
                </div>
            )
        } else {
            return (
                <div className="pane model">
                    <PaneLeft>
                        {demoInput}
                    </PaneLeft>
                    <PaneRight outputState={this.state.outputState}>
                        {demoOutput}
                    </PaneRight>
                </div>
            )
        }
    }
}

export default ModelComponent
