import React from 'react';
import ModelIntro from './ModelIntro'

const makeSnippet = (example, fields, maxLen = 60) => {
    if (example.snippet) {
        // If the example has a field called "snippet", use that;
        return example.snippet
    } else {
        // Otherwise, take the first field and truncate if necessary.
        const fieldName = fields[0].name
        const snippet = example[fieldName]

        if (snippet.length <= maxLen) {
            return snippet
        } else {
            return snippet.substring(0, maxLen) + "..."
        }
    }
}

class DemoInput extends React.Component {
    constructor(props) {
        super(props)

        // examples looks like [{passage: "...", question: "..."}, ...]
        // fields looks like [{name: "passage", label: "Passage", type: "TEXT_AREA"}, ...]
        // inputState (possibly) contains values for the various inputs
        // runModel
        const { examples, fields, inputState, runModel } = props

        // Populate state using (a copy of) provided values.
        this.state = inputState ? {...inputState} : {}

        // What happens when you change the example dropdown
        this.handleExampleChange = e => {
            if (e.target.value !== "") {
                // Because this is dynamic over fields, we need to be indirect.
                let stateUpdate = {}

                // For each field,
                fields.forEach(({name}) => {
                    // if the chosen example has a value for that field,
                    if (examples[e.target.value][name] !== undefined) {
                        // include it in the update.
                        stateUpdate[name] = examples[e.target.value][name];
                    }
                })

                // And now pass the updates to setState.
                this.setState(stateUpdate)
            }
        }

        // What happens when you change text in a TextArea or Input.
        // Notice that this is a double function. The first argument is
        // the field name to update.
        this.handleTextChange = name => e => {
            let stateUpdate = {}
            stateUpdate[name] = e.target.value;
            this.setState(stateUpdate)
        }

        // This just checks for Enter, and runs the model in that case.
        this.handleKeyDown = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                runModel(this.state)
            }
        }
    }

    render() {
        // We render the individual inputs by map-ping over the fields.
        const inputs = this.props.fields.map((field, idx) => {
            // The HTML id for this input:
            const inputId = `input--${this.props.selectedModel}-${field.name}`
            const label = field.label ? <label htmlFor={`#${inputId}`}>{field.label}</label> : null

            let input = null;

            switch (field.type) {
                case "TEXT_AREA":
                    input = (
                        <textarea
                         onChange={this.handleTextChange(field.name)}
                         onKeyDown={this.handleKeyDown}
                         id={inputId}
                         type="text"
                         required="true"
                         autoFocus={idx === 0}
                         placeholder={field.placeholder || ""}
                         value={this.state[field.name]}
                         disabled={this.props.outputState === "working"} />
                    )
                    break

                case "TEXT_INPUT":
                    input = (
                        <input
                         onChange={this.handleTextChange(field.name)}
                         onKeyDown={this.handleKeyDown}
                         id={inputId}
                         type="text"
                         required="true"
                         autoFocus={idx === 0}
                         placeholder={field.placeholder || ""}
                         value={this.state[field.name]}
                         disabled={this.props.outputState === "working"} />
                    )
                    break

                // TODO(joelgrus): add more widgets

                default:
                    console.error("unknown field type: " + field.type)
            }

            return (
                <div className="form__field" key={idx}>
                {label}
                {input}
                </div>
            )
        })

        return (
            <div className="model__content">
                <ModelIntro title={this.props.title} description={this.props.description} />
                <div className="form__instructions">
                    <span>Enter text or</span>
                    <select
                        disabled={this.props.outputState === "working"}
                        onChange={this.handleExampleChange}
                        onKeyDown={this.handleKeyDown}>
                            <option value="">Choose an example...</option>
                            {
                                this.props.examples.map((example, index) => {
                                    return (
                                        <option value={index} key={index}>{makeSnippet(example, this.props.fields)}</option>
                                    )
                                })
                            }
                    </select>
                </div>
                {inputs}
                <div className="form__field form__field--btn">
                    <button
                     id="input--mc-submit"
                     type="button"
                     disabled={this.props.outputState === "working"}
                     className="btn btn--icon-disclosure"
                     onClick={ () => this.props.runModel(this.state) }>Run
                        <svg>
                            <use xlinkHref="#icon__disclosure"></use>
                        </svg>
                    </button>
                </div>
            </div>
        )
    }
}

export default DemoInput
