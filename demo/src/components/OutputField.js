import React from 'react'

// A labeled output field with children
const OutputField = ({label, classes, children, suppressSummary}) => {
    const summaryClass = (label && !suppressSummary) ? 'model__content__summary ' : ''
    const extraClasses = classes || ''
    const className = summaryClass + extraClasses


    return (
        <div className="form__field">
            {label ? <label>{label}</label> : null}
            {className ? (
                <div className={className}>
                    {children}
                </div>
                ) : children}
        </div>
    )
}

export default OutputField
