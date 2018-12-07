import React from 'react'

// A labeled output field with children
const OutputField = ({label, classes, children}) => (
    <div className="form__field">
        {label ? <label>{label}</label> : null}
        <div className={`model__content__summary ${classes}`}>
            {children}
        </div>
    </div>
)

export default OutputField
