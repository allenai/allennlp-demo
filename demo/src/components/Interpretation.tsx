import React from 'react'
import colormap from 'colormap'
import styled from 'styled-components';

interface Props extends DefaultProps {
  tokensWithWeights: {token: string, weight: number}[];
}

interface DefaultProps {
  colormap: ColorMap
}

interface ColorMap {
  colorScheme: ColorScheme;
  format: ColorMapFormat; 
  nShades: number;
}

type ColorMapFormat = "hex" | "rgbaString" | "rba" | "float";

type ColorScheme = "jet" | "hsv" | "hot" | "cool" | "spring" |
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

class TextSaliencyMap extends React.Component<Props> {
  constructor(props: Props) {
    super(props)

    this.colorize = this.colorize.bind(this)
  }

  static defaultProps: DefaultProps = {
    colormap: {
      colorScheme: 'RdBu',
      format: 'hex',
      nShades: 20
    }
  }

  colorize(tokensWithWeights: {token: string, weight: number}[]) {
    let colors = colormap({
      colormap: this.props.colormap.colorScheme,
      format: this.props.colormap.format,
      nshades: Math.min(Math.max(this.props.colormap.nShades, 1), 72)
    })

    let result_string: JSX.Element[] = [];
    tokensWithWeights.forEach((obj: {token: string, weight: number}, idx: number) => {
      result_string.push(
        <ColorizedToken backgroundColor={obj['weight'] ? colors[Math.round(obj['weight'] * (this.props.colormap.nShades - 1))] : 'transparent'}
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

interface ColorizedTokenProps {
  backgroundColor: string;
}

const ColorizedToken = styled.span`
  background-color: ${(props:ColorizedTokenProps) => props.backgroundColor};
  padding: 5px;
  margin: 5px;
  display: inline-block;
  border-radius: 3px;
`;

export default TextSaliencyMap; 