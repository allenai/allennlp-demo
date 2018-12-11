import React from 'react';
import ModelIntro from './ModelIntro'

const truncate = (text, maxLen = 60) => {
    if (text.length <= maxLen) {
        return text
    } else {
        return text.substring(0, maxLen) + "..."
    }
}

const makeSnippet = (example, fields, maxLen = 60) => {
    if (example.snippet) {
        // If the example has a field called "snippet", use that;
        return example.snippet
    } else {
        // Otherwise, take the first field and truncate if necessary.
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
                // Because this is dynamic over fields, we need to be indirect.
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

        this.runOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                runModel(this.state)
            }
        }
    }

    render() {
        const { title, description, fields, selectedModel, outputState } = this.props

        // Only enable running the model if every required field has a value.
        const canRun = fields.every(field => field.optional || this.state[field.name])

        // We render the individual inputs by map-ping over the fields.
        const inputs = fields.map((field, idx) => {
            // The HTML id for this input:
            const inputId = `input--${selectedModel}-${field.name}`
            const label = field.label ? <label htmlFor={`#${inputId}`}>{field.label}</label> : null

            let input = null;

            switch (field.type) {
                case "TEXT_AREA":
                case "TEXT_INPUT":
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
                <ModelIntro title={title} description={description} />
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

export { DemoInput as default, truncate }
