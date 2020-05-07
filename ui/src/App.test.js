import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { modelComponents } from './models'

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

Object.keys(modelComponents).forEach(model => {
    it(`${model} can render`, () => {
        const div = document.createElement('div');
        const Component = modelComponents[model]
        ReactDOM.render(<Component />, div)
    })
})
