import React from 'react';
import {RadioGroup, Radio, Tooltip} from './Shared'
import ModelIntro from './ModelIntro'
import '../css/Button.css'

const PATTERN_NON_WORD_CHAR = /\W/;
const PATTERN_WORD_CHAR = /\w/;
const ELLIPSIS = '…';
/**
 * Truncates the provided text such that no more than limit characters are rendered and adds an
 * ellipsis upon truncation.  If the text is shorter than the provided limit, the full text is
 * returned.
 *
 * @param {string} text The text to truncate.
 * @param {number} limit The maximum number of characters to show.
 *
 * @return {string} the truncated text, or full text if it's shorter than the provided limit.
 */
const truncateText = (text, limit = 60) => {
    if (typeof limit !== 'number') {
      throw new Error('limit must be a number');
    }
    limit -= ELLIPSIS.length;
    if (text.length > limit) {
      while (
        limit > 1 &&
        (!PATTERN_WORD_CHAR.test(text[limit-1]) || !PATTERN_NON_WORD_CHAR.test(text[limit]))
      ) {
        limit -= 1;
      }
      if (limit === 1) {
        return text;
      } else {
        return text.substring(0, limit) + ELLIPSIS;
      }
    } else {
      return text;
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
        return truncateText(snippet, maxLen)
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
        this.handleInputChange = fieldName => e => {
            let stateUpdate = {}
            stateUpdate[fieldName] = e.target.value;
            this.setState(stateUpdate)
        }

        // for radio input, the second param is simply the value
        this.handleRadioInputChange = fieldName => value => {
            let stateUpdate = {}
            stateUpdate[fieldName] = value;
            this.setState(stateUpdate)
        }

        // Handler that runs the model if 'Enter' is pressed.
        this.runOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                runModel(this.state)
            }
        }
    }

    render() {
        const { title, description, descriptionEllipsed, fields, selectedModel, outputState } = this.props

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
                                field.options.map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))
                            }
                        </select>
                    )
                    break

                case "RADIO":
                    input = (
                        // If we have no value for this select, use the first option.
                        <RadioGroup
                            name={inputId}
                            selectedValue={this.state[field.name] || (field.options[0] && field.options[0].name)}
                            onChange={this.handleRadioInputChange(field.name)}
                            disabled={outputState === "working"}>
                            {
                                field.options.map((opt) => (
                                    <label key={opt.name} data-tip={opt.desc}>
                                        <Radio value={opt.name}/>{opt.name}
                                    </label>
                                ))
                            }
                      </RadioGroup>
                    )
                    break
                default:
                    console.error("unknown field type: " + field.type)
            }

            return (
                <div className="form__field" key={field.name}>
                {label}
                {input}
                </div>
            )
        })

        return (
            <div className="model__content answer">
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
                     onClick={ () => this.props.runModel(this.state) }>Run
                        <svg>
                            <use xlinkHref="#icon__disclosure"></use>
                        </svg>
                    </button>
                </div>
                <Tooltip multiline/>
            </div>
        )
    }
}

export { DemoInput as default, truncateText }
