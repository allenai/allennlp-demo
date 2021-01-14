import React, { useState } from 'react';
import styled from 'styled-components';
import colormap from 'colormap';
import { Tooltip, Slider } from 'antd';

interface DefaultProps {
    colormapProps: ColorMapProps;
}

interface Props extends DefaultProps {
    interpretData: number[][];
    inputTokens: string[][];
    inputHeaders: string[];
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

/**
 * Renders a component that displays each word of the tokens with a different color based on the
 * associated weight.
 *
 * There is also a slider used to decide a cutoff on what weights to not render.
 */
export const Saliency = (props: Props) => {
    const [topK, setTopK] = useState<{ [id: string]: number }>({ all: 3 }); // 3 words are highlighted by default

    const getTokenWeightPairs = (grads: number[], tokens: string[]) => {
        return tokens.map((token, idx: number) => {
            const weight = grads[idx] || 1;
            // We do 1 - weight because the colormap is inverted
            return { token, weight: 1 - weight };
        });
    };

    const colorize = (tokensWithWeights: TokensWithWeight[], topKIdx: Set<number>) => {
        const { colormapProps } = props;
        // colormap package takes minimum of 6 shades
        const nshades = Math.min(Math.max(colormapProps.nshades, 6), 72);
        const colors = colormap({ ...colormapProps, nshades });

        const colorizedString = tokensWithWeights.map((obj, idx) => {
            // Again, 1 -, in this case because low extreme is blue and high extreme is red
            return (
                <Tooltip
                    key={idx}
                    title={new Intl.NumberFormat(undefined, { minimumFractionDigits: 3 }).format(
                        1 - obj.weight
                    )}>
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
    };

    // when the user changes the slider for input 1, update how many tokens are highlighted
    const handleInputTopKChange = (inputIndex: number) => (e: number) => {
        const update = Object.assign({}, topK);
        update[inputIndex] = e;
        setTopK(update);
    };

    // Extract top K tokens by saliency value and return only the indices of the top tokens
    const getTopKIndices = (tokensWithWeights: TokensWithWeight[], inputIndex: number) => {
        const gradCompare = (obj1: TokensWithWeight, obj2: TokensWithWeight) => {
            return obj1.weight - obj2.weight;
        };

        // Add indices so we can keep track after sorting
        const indexedTokens = tokensWithWeights.map((obj, idx) => {
            return { ...obj, idx };
        });
        indexedTokens.sort(gradCompare);

        const k = inputIndex in topK ? topK[inputIndex] : topK.all;
        const topKTokens = indexedTokens.slice(0, k);
        return topKTokens.map((obj) => obj.idx);
    };

    const { interpretData, inputTokens, inputHeaders } = props;

    const saliencyMaps = [];
    for (let i = 0; i < inputTokens.length; i++) {
        const grads = interpretData[i];
        const tokens = inputTokens[i];
        const header = inputHeaders[i];
        const tokenWeights = getTokenWeightPairs(grads, tokens);
        // indices with the top gradient values
        const topKIdx = new Set(getTopKIndices(tokenWeights, i));
        // the tokens highlighted based on their top values
        const colorMap = colorize(tokenWeights, topKIdx);
        const k = i in topK ? topK[i] : topK.all;
        const saliencyMap = (
            <div key={i}>
                <h6>{header}</h6>
                {colorMap}
                <Slider
                    min={0}
                    max={colorMap.length}
                    step={1}
                    defaultValue={k}
                    value={topK[i.toString()]}
                    onChange={handleInputTopKChange(i)}
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
};

Saliency.defaultProps = {
    colormapProps: {
        colormap: 'copper',
        format: 'hex',
        nshades: 20,
    },
};

const ColorizedToken = styled.span<{ backgroundColor: string }>`
    background-color: ${({ backgroundColor }) => backgroundColor};
    padding: 1px;
    margin: 1px;
    display: inline-block;
    border-radius: ${({ theme }) => theme.shape.borderRadius.default};
`;

const Info = styled.span`
    color: ${({ theme }) => theme.color.G9};
`;
