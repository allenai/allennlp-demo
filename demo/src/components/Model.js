import React from 'react'
import styled from 'styled-components';

import { PaneTop, PaneBottom } from './Pane'
import DemoInput from './DemoInput'

class Model extends React.Component {
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
        this.props.history.push(location)
        // requestData, responseData
      }).catch((error) => {
        this.setState({outputState: "error"});
        console.error(error);
      });
    }

    render() {
        const { title, description, descriptionEllipsed, examples, fields, selectedModel, Output } = this.props;
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

        const demoOutput = requestData && responseData ? <Output {...this.state}/> : null

        return (
            <Wrapper className="pane__horizontal model">
                <PaneTop>{demoInput}</PaneTop>
                <PaneBottom outputState={outputState}>{demoOutput}</PaneBottom>
            </Wrapper>
        )
    }
}

export const Wrapper = styled.div`
  background: ${({theme}) => theme.palette.background.light};
  display: block;
  width: 100%;
  overflow-y: auto;
`;

export default Model
