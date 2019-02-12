import React from 'react'

const TextVisualization = ({ verbs, model }) => (
    <div className={`model__content model__content--${model}-output`}>
        <div>
            {verbs.map((verb, i) => {
                return (
                    <p key={i}><b>{verb.verb}:</b> {verb.description}</p>
                )
            })}
        </div>
  </div>
)

export default TextVisualization

