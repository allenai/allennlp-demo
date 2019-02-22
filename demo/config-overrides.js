// Using react-app-rewired to tweak the create-react-app webpack config(s) without using 'eject' and
// without creating a fork of the react-scripts.
//
// This is needed for styled-components (react-app-rewire-styled-components)
// but is generally useful if we want to add other configurations in the future.
// see: https://github.com/timarney/react-app-rewired

const rewireStyledComponents = require('react-app-rewire-styled-components');

module.exports = function override(config, env) {
  // do stuff with the webpack config...
  config = rewireStyledComponents(config, env);
  return config;
}
