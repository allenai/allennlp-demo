/**
 * Renders a component that displays each word of the tokens with a different color based on the
 * associated weight.
 *
 * There is also a slider used to decide a cutoff on what weights to not render.
 */

import React from 'react';
import styled from 'styled-components';
import colormap from 'colormap';
import { Tooltip, Slider } from 'antd';

interface DefaultProps {
    colormapProps: ColorMapProps;
}

interface Props extends DefaultProps {
    interpretData: [number[], number[]];
    inputTokens: [string[], string[]];
    inputHeaders: JSX.Element[];
}

interface State {
    topK: { [id: string]: number };
}

interface ColorMapProps {
    colormap: ColorScheme;
    format: ColorMapFormat;
    nshades: number;
}

type ColorMapFormat = 'hex' | 'rgbaString' | 'rba' | 'float';

type ColorScheme =
    | 'jet'
    | 'hsv'
    | 'hot'
    | 'cool'
    | 'spring'
    | 'summer'
    | 'autumn'
    | 'winter'
    | 'bone'
    | 'copper'
    | 'greys'
    | 'YIGnBu'
    | 'greens'
    | 'YIOrRd'
    | 'bluered'
    | 'RdBu'
    | 'picnic'
    | 'rainbow'
    | 'portland'
    | 'blackbody'
    | 'earth'
    | 'electric'
    | 'viridis'
    | 'inferno'
    | 'magma'
    | 'plasma'
    | 'warm'
    | 'rainbow-soft'
    | 'bathymetry'
    | 'cdom'
    | 'chlorophyll'
    | 'density'
    | 'freesurface-blue'
    | 'freesurface-red'
    | 'oxygen'
    | 'par'
    | 'phase'
    | 'salinity'
    | 'temperature'
    | 'turbidity'
    | 'velocity-blue'
    | 'velocity-green'
    | 'cubehelix';

interface TokensWithWeight {
    token: string;
    weight: number;
}

export class Saliency extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            topK: { all: 3 }, // 3 words are highlighted by default
        };
    }

    static defaultProps: DefaultProps = {
        colormapProps: {
            colormap: 'copper',
            format: 'hex',
            nshades: 20,
        },
    };

    getTokenWeightPairs(grads: number[], tokens: string[]) {
        return tokens.map((token, idx: number) => {
            const weight = grads[idx];
            // We do 1 - weight because the colormap is inverted
            return { token, weight: 1 - weight };
        });
    }

    colorize(tokensWithWeights: TokensWithWeight[], topKIdx: Set<number>) {
        const { colormapProps } = this.props;
        // colormap package takes minimum of 6 shades
        colormapProps.nshades = Math.min(Math.max(colormapProps.nshades, 6), 72);
        const colors = colormap(colormapProps);

        const colorizedString = tokensWithWeights.map((obj, idx) => {
            // Again, 1 -, in this case because low extreme is blue and high extreme is red
            return (
                <Tooltip key={idx} title={(1 - obj.weight).toFixed(3)}>
                    <span>
                        <ColorizedToken
                            backgroundColor={
                                topKIdx.has(idx)
                                    ? colors[Math.round(obj.weight * (colormapProps.nshades - 1))]
                                    : 'transparent'
                            }>
                            {obj.token}
                        </ColorizedToken>
                    </span>
                </Tooltip>
            );
        });
        return colorizedString;
    }

    // when the user changes the slider for input 1, update how many tokens are highlighted
    handleInputTopKChange = (inputIndex: number) => (e: number) => {
        const stateUpdate = Object.assign({}, this.state);
        stateUpdate.topK[inputIndex] = e;
        this.setState(stateUpdate);
    };

    // Extract top K tokens by saliency value and return only the indices of the top tokens
    getTopKIndices(tokensWithWeights: TokensWithWeight[], inputIndex: number) {
        function gradCompare(obj1: TokensWithWeight, obj2: TokensWithWeight) {
            return obj1.weight - obj2.weight;
        }

        // Add indices so we can keep track after sorting
        const indexedTokens = tokensWithWeights.map((obj, idx) => {
            return { ...obj, ...{ idx } };
        });
        indexedTokens.sort(gradCompare);

        const k = inputIndex in this.state.topK ? this.state.topK[inputIndex] : this.state.topK.all;
        const topKTokens = indexedTokens.slice(0, k);
        return topKTokens.map((obj) => obj.idx);
    }

    render() {
        const { interpretData, inputTokens, inputHeaders } = this.props;

        const saliencyMaps = [];
        for (let i = 0; i < inputTokens.length; i++) {
            const grads = interpretData[i];
            const tokens = inputTokens[i];
            const header = inputHeaders[i];
            const tokenWeights = this.getTokenWeightPairs(grads, tokens);
            // indices with the top gradient values
            const topKIdx = new Set(this.getTopKIndices(tokenWeights, i));
            // the tokens highlighted based on their top values
            const colorMap = this.colorize(tokenWeights, topKIdx);
            const k = i in this.state.topK ? this.state.topK[i] : this.state.topK.all;
            const saliencyMap = (
                <div key={i}>
                    {header}
                    {colorMap}
                    <Slider
                        min={0}
                        max={colorMap.length}
                        step={1}
                        defaultValue={k}
                        value={this.state.topK[i.toString()]}
                        onChange={this.handleInputTopKChange(i)}
                    />
                    <br />
                    <Info>Visualizing the top {k} most important words.</Info>
                    <br />
                    <br />
                </div>
            );
            saliencyMaps.push(saliencyMap);
        }

        return <div>{saliencyMaps}</div>;
    }
}

const ColorizedToken = styled.span<{ backgroundColor: string }>`
    background-color: ${({ backgroundColor }) => backgroundColor};
    padding: 1px;
    margin: 1px;
    display: inline-block;
    border-radius: ${({ theme }) => theme.shape.borderRadius.default};
`;

const Info = styled.span`
    color: ${({ theme }) => theme.color.B6};
`;
