import React from 'react';
import BeamSearch from './BeamSearch'
import ModelIntro from './ModelIntro'
import '../css/Button.css'

// If `text` is longer than `maxLen`, truncate it and add "...".
// Otherwise just return it as-is.
const truncate = (text, maxLen = 60) => {
    if (text.length <= maxLen) {
        return text
    } else {
        return text.substring(0, maxLen) + "..."
    }
}

// Create a dropdown "snippet" for an example.
// If the example has a field called "snippet", use that;
// Otherwise, take the first field and truncate if necessary.
const makeSnippet = (example, fields, maxLen = 60) => {
    if (example.snippet) {
        return example.snippet
    } else {
        const fieldName = fields[0].name
        const snippet = example[fieldName]
        return truncate(snippet, maxLen)
    }
}

class DemoInput extends React.Component {
    constructor(props) {
        super(props)

        const { examples, fields, inputState, runModel } = props

        // Populate state using (a copy of) provided values.
        this.state = inputState ? {...inputState} : {}

        // What happens when you change the example dropdown
        this.handleExampleChange = e => {
            const exampleId = e.target.value
            if (exampleId !== "") {
                // Because the field names vary by model, we need to be indirect.
                let stateUpdate = {}

                // For each field,
                fields.forEach(({name}) => {
                    // if the chosen example has a value for that field,
                    if (examples[exampleId][name] !== undefined) {
                        // include it in the update.
                        stateUpdate[name] = examples[exampleId][name];
                    }
                })

                // And now pass the updates to setState.
                this.setState(stateUpdate)
            }
        }

        // What happens when you change an input. This works for text
        // inputs and also select inputs. The first argument is
        // the field name to update.
        this.handleInputChange = name => e => {
            let stateUpdate = {}
            stateUpdate[name] = e.target.value;
            this.setState(stateUpdate)
        }

        // Handler that runs the model if 'Enter' is pressed.
        this.runOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                runModel(this.independentInputs())
            }
        }

        // Some of the inputs (e.g. interactive beam search)
        // depend on the previous outputs, so when we do a new run
        // we need to clear them out.
        this.independentInputs = () => {
            let inputs = {...this.state}

            fields.forEach((field) => {
                (field.dependentInputs || []).forEach((name) => {
                    delete inputs[name]
                })
            })

            console.log(inputs)
            return inputs
        }
    }

    render() {
        const { title, description, descriptionEllipsed, fields, selectedModel, outputState, responseData, inputState } = this.props

        // Only enable running the model if every required field has a value.
        const canRun = fields.every(field => field.optional || this.state[field.name])

        // Fields that are inputs only.
        const inputs = []

        // Fields that are both inputs and outputs (e.g. beam search). These will be
        // rendered below the RUN button.
        const inputOutputs = []

        fields.forEach((field, idx) => {
            // The HTML id for this input:
            const inputId = `input--${selectedModel}-${field.name}`
            const label = field.label ? <label htmlFor={`#${inputId}`}>{field.label}</label> : null

            let input = null;

            switch (field.type) {
                case "TEXT_AREA":
                case "TEXT_INPUT":
                    // Both text area and input have the exact same properties.
                    const props = {
                        onChange: this.handleInputChange(field.name),
                        onKeyDown: canRun ? this.runOnEnter : undefined,
                        id: inputId,
                        type: "text",
                        required: "true",
                        autoFocus: idx === 0,
                        placeholder: field.placeholder || "",
                        value: this.state[field.name],
                        disabled: outputState === "working"
                    }

                    input = field.type === "TEXT_AREA" ? <textarea {...props}/> : <input {...props}/>
                    break

                case "SELECT":
                    input = (
                        // If we have no value for this select, use the first option.
                        <select value={this.state[field.name] || field.options[0]}
                                onChange={this.handleInputChange(field.name)}
                                disabled={outputState === "working"}>
                            {
                                field.options.map((value, idx) => (
                                    <option key={idx} value={value}>{value}</option>
                                ))
                            }
                        </select>
                    )
                    break

                case "BEAM_SEARCH":
                    if (outputState !== "working") {
                        const { best_action_sequence, choices } = responseData || {}
                        const runSequenceModel = (extraState) => this.props.runModel({...this.state, ...extraState}, true)

                        input = <BeamSearch inputState={inputState}
                                            bestActionSequence={best_action_sequence}
                                            choices={choices}
                                            runSequenceModel={runSequenceModel}/>
                    }
                    break

                default:
                    console.error("unknown field type: " + field.type)
            }

            const div = (
                <div className="form__field" key={idx}>
                {label}
                {input}
                </div>
            )

            // By default we assume a field is just an input,
            // unless it has the ``inputOutput`` attribute set.
            if (field.inputOutput) {
                inputOutputs.push(div)
            } else {
                inputs.push(div)
            }
        })


        return (
            <div className="model__content">
                <ModelIntro title={title} description={description} descriptionEllipsed={descriptionEllipsed}/>
                <div className="form__instructions">
                    <span>Enter text or</span>
                    <select
                        disabled={outputState === "working"}
                        onChange={this.handleExampleChange}>
                            <option value="">Choose an example...</option>
                            {
                                this.props.examples.map((example, index) => {
                                    return (
                                        <option value={index} key={index}>{makeSnippet(example, fields)}</option>
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
                     disabled={!canRun || outputState === "working"}
                     className="btn btn--icon-disclosure"
                     onClick={ () => this.props.runModel(this.independentInputs()) }>Run
                        <svg>
                            <use xlinkHref="#icon__disclosure"></use>
                        </svg>
                    </button>
                </div>
                {inputOutputs}
            </div>
        )
    }
}

export { DemoInput as default, truncate }
