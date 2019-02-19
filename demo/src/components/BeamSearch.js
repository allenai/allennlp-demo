import React from 'react';
import '../css/BeamSearch.css';


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

        let table = null
        if (predictedActions) {
            const headers = predictedActions.map(pa => pa.predicted_action)
            const cols = predictedActions.map((pa, timestep) => {
                if (timestep >= initialSequence.length) {
                    const choicesWithProbabilities = pa.considered_actions.map(
                        (action, i) => ({action, "probability": pa.action_probabilities[i]}))
                    // Sort highest probability to lowest
                    choicesWithProbabilities.sort((a, b) => b.probability - a.probability)

                    return choicesWithProbabilities
                } else {
                    // Show no choices
                    return []
                }
            })
            const numRows = Math.max(...cols.map(c => c.length))

            const click = (row, col) => () => {
                // Want to force sequence up to (row ,col)
                const sequence = initialSequence.slice(0, col)
                let idx = sequence.length
                while (idx < col) {
                    sequence.push(headers[idx])
                    idx++
                }
                // Now add the specific element
                sequence.push(cols[col][row].action)

                runSequenceModel({initial_sequence: sequence})
            }

            const clearThrough = (col) => ()  => {
                const sequence = initialSequence.slice(0, col)
                runSequenceModel({initial_sequence: sequence})
            }

            const headerRow = (
                <tr>
                    {headers.map((h, j) => <th key={`header-${j}-${h}`}
                                               className={j < initialSequence.length ? "forced" : null}
                                               onClick={clearThrough(j)}>{h}</th>)}
                </tr>
            )

            const choices = []
            for (let i = 0; i < numRows; i++) {
                // i-th row contains the i-th value from each column (if it exists)
                const values = cols.map(col => col[i] || {})

                const makeTd = (i, j, probability, action) => {
                    const content = action ? (
                        <div className="action-choice-with-probability">
                            <div className="action-choice">{action}</div>
                            <div className="action-probability">{probability.toFixed(3)}</div>
                        </div>
                    ) : null

                    return (
                        <td key={`value-${i}-${j}-${action}`} onClick={click(i, j)}>
                            {content}
                        </td>
                    )
                }

                const tds = values.map(({probability, action}, j) => makeTd(i, j, probability, action))

                const row = (
                    <tr key={`row-${i}`}>
                        {tds}
                    </tr>
                )
                choices.push(row)
            }

            table = (
                <table className="beam-search">
                    <thead>
                        {headerRow}
                    </thead>
                    <tbody>
                        {choices}
                    </tbody>
                </table>
            )
        }


        return (
            <div>
                {table}
            </div>
        )
    }
}

export default BeamSearch
