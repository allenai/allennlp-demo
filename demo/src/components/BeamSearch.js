import React from 'react';
import '../css/BeamSearch.css';

// Component representing an element of the sequence that has been fixed,
// with an X to "unchoose" it.
const Chosen = ({action, unchoose, idx}) => (
    <li className="chosen" key={idx}>
        <a className="action">{action}</a>
        <span className="unchoose" role="img" aria-label="x" onClick={unchoose}>❌</span>
    </li>
)

// Component representing an element of the sequence that can be selected,
// with a dropdown containing all the possible choices.
const ChoiceDropdown = ({predictedAction, choices, choose, idx}) => {

    const options = choices.map(([probability, action], i) => (
        <li className="choice" key={i} onClick={() => choose(action)}>
            <a className="probability">{probability.toFixed(3)}</a>
            <a className="action-choice">{action}</a>
        </li>
    ))

    return (
        <li className="choice-dropdown" key={idx}>
            <a className="predicted-action">{predictedAction}</a>
            <ul className="choices">
                {options}
            </ul>
        </li>
    )
}


class BeamSearch extends React.Component {
    constructor(props) {
        super(props)

        const { inputState } = props
        const initialSequence = (inputState && inputState.initial_sequence) || []
        this.state = { initialSequence }
    }


    render() {
        const { initialSequence } = this.state
        const { bestActionSequence, choices, runSequenceModel } = this.props

        // To "unchoose" the choice at a given index, we just rerun the model
        // with initial_sequence truncaated at that point.
        const unchoose = (idx) => () => {
            runSequenceModel({initial_sequence: initialSequence.slice(0, idx)})
        }

        // To choose an action at an index, we start with the existing forced choices,
        // then fill in with the elements of the bestActionSequence, and finally add
        // the chosen action.
        const choose = (idx) => (action) => {
            const sequence = initialSequence.slice(0, idx)
            while (sequence.length < idx) {
                sequence.push(bestActionSequence[sequence.length])
            }

            sequence.push(action)
            runSequenceModel({initial_sequence: sequence})
        }

        // We only want to render anything if ``bestActionSequence`` is defined;
        // that is, if we have a beam search result.
        if (bestActionSequence) {
            const listItems = bestActionSequence.map((action, idx) => {
                // Anything in ``initialSequence`` has already been chosen.
                if (idx < initialSequence.length) {
                    return <Chosen key={idx} action={action} unchoose={unchoose(idx)}/>
                } else {
                // Otherwise we need to offer a choice dropdown, and we should sort
                // from highest probability to lowest probability.
                const timestepChoices = choices[idx]
                timestepChoices.sort((a, b) => (b[0] - a[0]))

                return <ChoiceDropdown key={idx}
                                       predictedAction={action}
                                       choices={timestepChoices}
                                       choose={choose(idx)}/>
                }
            })

            return (
                <div>
                    <label>
                        Interactive Beam Search
                    </label>
                    <ul className="beam-search">
                        {listItems}
                    </ul>
                </div>
            )
        } else {
            return null
        }
    }
}

export default BeamSearch
