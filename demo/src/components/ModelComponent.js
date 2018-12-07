import React from 'react'
import { PaneLeft, PaneRight } from './Pane'
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
      const { title, description, examples, fields, selectedModel } = this.props;
      const { requestData, responseData } = this.state;

      return (
        <div className="pane model">
          <PaneLeft>
            <DemoInput selectedModel={selectedModel}
                       title={title}
                       description={description}
                       examples={examples}
                       fields={fields}
                       inputState={requestData}
                       outputState={this.state.outputState}
                       runModel={this.runModel} />
          </PaneLeft>
          <PaneRight outputState={this.state.outputState}>
            {this.props.outputComponent({requestData, responseData})}
          </PaneRight>
        </div>
      );

    }
}

export default ModelComponent
