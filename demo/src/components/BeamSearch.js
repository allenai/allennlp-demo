import React from 'react';
import '../css/BeamSearch.css';

const Chosen = ({action, unchoose, idx}) => (
    <li className="chosen" key={idx}>
        <a className="action">{action}</a>
        <span className="unchoose" role="img" aria-label="x" onClick={unchoose}>❌</span>
    </li>
)

const ChoiceDropdown = ({predictedAction, choices, choose, idx}) => {

    const options = choices.map(({action, probability}, i) => (
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
        const { predictedActions, runSequenceModel } = this.props

        const unchoose = (idx) => () => {
            runSequenceModel({initial_sequence: initialSequence.slice(0, idx)})
        }

        const choose = (idx) => (action) => {
            const sequence = initialSequence.slice(0, idx)
            while (sequence.length < idx) {
                sequence.push(predictedActions[sequence.length].predicted_action)
            }

            sequence.push(action)
            runSequenceModel({initial_sequence: sequence})
        }

        let listItems = []
        if (predictedActions) {
            // Get fixed items
            listItems = initialSequence.map((action, idx) => (
                <Chosen key={idx} action={action} unchoose={unchoose(idx)}/>
            ))

            // Get dropdown items
            predictedActions.forEach((predictedAction, idx) => {
                if (idx >= initialSequence.length) {
                    const choices = predictedAction.considered_actions.map((action, i) => (
                        {action, probability: predictedAction.action_probabilities[i]}
                    ))
                    choices.sort((a, b) => (b.probability - a.probability))

                    listItems.push(
                        <ChoiceDropdown key={idx}
                                        predictedAction={predictedAction.predicted_action}
                                        choices={choices}
                                        choose={choose(idx)}/>
                    )
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
