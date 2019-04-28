import React from 'react'
import colormap from 'colormap'
import styled from 'styled-components';

interface Props {
  tokensWithWeights: {token: string, weight: number}[];
  colorScheme: "jet" | "hsv" | "hot" | "cool" | "spring" |
               "summer" | "autumn" | "winter" | "bone" | 
               "copper" | "greys" | "YIGnBu" | "greens" |
               "YIOrRd" | "bluered" | "RdBu" | "picnic" |
               "rainbow" | "portland" | "blackbody" | "earth" |
               "electric" | "viridis" | "inferno" | "magma" |
               "plasma" | "warm" | "rainbow-soft" | "bathymetry" |
               "cdom" | "chlorophyll" | "density" | "freesurface-blue" |
               "freesurface-red" | "oxygen" | "par" | "phase" | "salinity" |
               "temperature" | "turbidity" | "velocity-blue" |
               "velocity-green" | "cubehelix";
  nShades: number;
}

const ColorizedToken = styled.span`
  background-color: ${props => props.color};
  padding: 5px;
  margin: 5px;
  display: inline-block;
  border-radius: 3px;
`;

type DefaultProps = {
  colorScheme: "jet" | "hsv" | "hot" | "cool" | "spring" |
  "summer" | "autumn" | "winter" | "bone" | 
  "copper" | "greys" | "YIGnBu" | "greens" |
  "YIOrRd" | "bluered" | "RdBu" | "picnic" |
  "rainbow" | "portland" | "blackbody" | "earth" |
  "electric" | "viridis" | "inferno" | "magma" |
  "plasma" | "warm" | "rainbow-soft" | "bathymetry" |
  "cdom" | "chlorophyll" | "density" | "freesurface-blue" |
  "freesurface-red" | "oxygen" | "par" | "phase" | "salinity" |
  "temperature" | "turbidity" | "velocity-blue" |
  "velocity-green" | "cubehelix";
  nShades: number;
}

class ExplanationSaliencyMap extends React.Component<Props> {
  constructor(props: Props) {
    super(props)

    this.colorize = this.colorize.bind(this)
  }

  static defaultProps: DefaultProps = {
    colorScheme: 'RdBu',
    nShades: 20
  }

  colorize(tokensWithWeights: {token: string, weight: number}[]) {
    let colors = colormap({
      colormap: this.props.colorScheme,
      format: 'hex',
      nshades: this.props.nShades
    })

    let result_string: JSX.Element[] = [];
    tokensWithWeights.forEach((obj: {token: string, weight: number}, idx: number) => {
      result_string.push(
        <ColorizedToken color={obj['weight'] ? colors[Math.round(obj['weight'] * (this.props.nShades - 1))] : 'transparent'}
                        key={idx}>{obj['token']}
        </ColorizedToken>
      )
    })

    return result_string 
  }

  render() {
    const { tokensWithWeights } = this.props 
    const token_color_map = this.colorize(tokensWithWeights)
    
    return (
      <div>
        {token_color_map}
      </div>
    )
  }
}


export default ExplanationSaliencyMap; 
