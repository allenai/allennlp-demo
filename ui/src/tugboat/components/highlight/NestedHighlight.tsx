import React from 'react';

import {
    Highlight,
    getHighlightColor,
    HighlightColor,
    Value,
    BaseHighlightProps,
} from './Highlight';
import { HighlightContainer } from './HighlightContainer';

interface BaseNestedHighlightProps extends BaseHighlightProps {
    // TODO: [jon 3] yuck we have a value or a function
    highlightColor?: HighlightColor | ((index: Cluster) => HighlightColor);
    tokenSeparator?: JSX.Element;
}

interface Cluster {
    cluster: string;
    // TODO: [jon 4] yuck, just put almost anything in here
    contents: (JSX.Element | string | Cluster | undefined)[];
    end: number;
    clusterIndex: number;
}

const isCluster = (pred: any): pred is Cluster => {
    const typedPred = pred as Cluster;
    return (
        typedPred.cluster !== undefined &&
        typedPred.contents !== undefined &&
        typedPred.end !== undefined &&
        typedPred.clusterIndex !== undefined
    );
};

export interface ClusterMap {
    [key: string]: number[][];
}

/**
 * Helper function for transforming response data into a tree object.
 *
 * @param tokens a list of strings of each of the tokens (words or punctuation) present
 * @param clusters a collection of arrays that specify spans to be clustered in the original list of tokens
 */
const transformToTree = (tokens: (JSX.Element | string)[], clusters: ClusterMap) => {
    const contains = (span: number[], index: number) => {
        return index >= span[0] && index <= span[1];
    };

    const insideClusters: Cluster[] = [
        {
            cluster: '',
            contents: [],
            end: -1,
            clusterIndex: -1,
        },
    ];

    tokens.forEach((token, i) => {
        // Find all the new clusters we are entering at the current index
        const newClusters: Cluster[] = [];
        Object.keys(clusters).forEach((key, j) => {
            const cluster = clusters[key];
            // Make sure we're not already in this cluster
            if (!insideClusters.map((c) => c.cluster).includes(key)) {
                cluster.forEach((span) => {
                    if (contains(span, i)) {
                        newClusters.push({
                            end: span[1],
                            cluster: key,
                            clusterIndex: j,
                            contents: [],
                        });
                    }
                });
            }
        });

        // Enter each new cluster, starting with the leftmost
        newClusters
            .sort(function (a, b) {
                return b.end - a.end;
            })
            .forEach((newCluster) => {
                // Descend into the new cluster
                insideClusters.push({
                    cluster: newCluster.cluster,
                    contents: [],
                    end: newCluster.end,
                    clusterIndex: newCluster.clusterIndex,
                });
            });

        // Add the current token into the current cluster
        insideClusters[insideClusters.length - 1].contents.push(token);

        // Exit each cluster we're at the end of
        while (insideClusters.length > 0 && insideClusters[insideClusters.length - 1].end === i) {
            const topCluster = insideClusters.pop();
            insideClusters[insideClusters.length - 1].contents.push(topCluster);
        }
    });

    return insideClusters[0].contents;
};

interface InnerProps extends BaseNestedHighlightProps {
    data: (string | JSX.Element | Cluster | undefined)[];
    depth: number;
}

/**
 * Not meant to be used outside of the Nested Highlight.
 */
const InnerHighlight = ({
    activeDepths,
    activeIds,
    data,
    depth,
    isClickable,
    isClicking,
    labelPosition,
    onMouseDown,
    onMouseOut,
    onMouseOver,
    onMouseUp,
    selectedId,
    highlightColor,
    tokenSeparator,
}: InnerProps) => {
    const lenData = data.length;
    return (
        <>
            {data.map((token, idx) => {
                return isCluster(token) ? (
                    <Highlight
                        activeDepths={activeDepths}
                        activeIds={activeIds}
                        color={
                            (typeof highlightColor === 'function'
                                ? highlightColor(token)
                                : highlightColor) || getHighlightColor(token.clusterIndex)
                        }
                        depth={depth}
                        id={token.cluster}
                        isClickable={isClickable}
                        isClicking={isClicking}
                        key={idx}
                        label={token.cluster}
                        labelPosition={labelPosition}
                        onMouseDown={onMouseDown}
                        onMouseOut={onMouseOut}
                        onMouseOver={onMouseOver}
                        onMouseUp={onMouseUp}
                        selectedId={selectedId}>
                        <InnerHighlight
                            activeDepths={activeDepths}
                            activeIds={activeIds}
                            data={token.contents}
                            depth={depth + 1}
                            isClickable={isClickable}
                            isClicking={isClicking}
                            labelPosition={labelPosition}
                            onMouseDown={onMouseDown}
                            onMouseOut={onMouseOut}
                            onMouseOver={onMouseOver}
                            onMouseUp={onMouseUp}
                            selectedId={selectedId}
                        />
                    </Highlight>
                ) : (
                    <span key={idx}>
                        {token}
                        {idx === lenData - 1 ? null : tokenSeparator || <>&nbsp;</>}
                    </span>
                );
            })}
        </>
    );
};

interface NestedHighlightProps extends BaseNestedHighlightProps {
    clusters: ClusterMap;
    tokens: (JSX.Element | string)[];
    className?: string;
}

/**
 * A function that recursively handles rendering spans of text to highlight.
 * Use in conjunction withHighlightClickHandling if isClickable is true.
 */
export const NestedHighlight = ({
    activeDepths,
    activeIds,
    clusters,
    isClickable,
    isClicking,
    labelPosition,
    onMouseDown,
    onMouseOut,
    onMouseOver,
    onMouseUp,
    selectedId,
    tokens,
    highlightColor,
    tokenSeparator,
    className,
}: NestedHighlightProps) => {
    const data = transformToTree(tokens, clusters);
    return (
        <HighlightContainer className={className} centerLabels={true}>
            <InnerHighlight
                activeDepths={activeDepths}
                activeIds={activeIds}
                data={data}
                depth={0}
                isClickable={isClickable}
                isClicking={isClicking}
                labelPosition={labelPosition}
                onMouseDown={onMouseDown}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                onMouseUp={onMouseUp}
                selectedId={selectedId}
                highlightColor={highlightColor}
                tokenSeparator={tokenSeparator}
            />
        </HighlightContainer>
    );
};

interface HocProps extends NestedHighlightProps {}

interface HocState {
    activeDepths: { ids: Value[]; depths: number[] };
    activeIds?: Value[];
    isClicking?: boolean;
    selectedCluster: number;
    selectedId?: Value;
}

/**
 * An HOC that handles highlight click handling state and passes through
 * any given props.
 *
 * @param WrappedComponent Any component that requires highlight click handling
 */
export const withHighlightClickHandling = (
    WrappedComponent: React.ComponentType<NestedHighlightProps>
) => {
    return class _withHighlightClickHandling extends React.Component<HocProps, HocState> {
        constructor(props: NestedHighlightProps) {
            super(props);
            this.state = {
                selectedCluster: -1,
                activeIds: [],
                activeDepths: { ids: [], depths: [] },
                isClicking: false,
            };
        }

        handleHighlightMouseDown = (id: Value, depth: number) => {
            const { activeDepths } = this.state;
            activeDepths.ids.push(id);
            activeDepths.depths.push(depth);

            this.setState({
                activeIds: [id],
                activeDepths,
                isClicking: true,
            });
        };

        handleHighlightMouseUp = (id: Value) => {
            const { activeDepths } = this.state;
            const deepestIndex = activeDepths.depths.indexOf(Math.max(...activeDepths.depths));

            this.setState((prevState) => ({
                selectedId:
                    prevState.selectedId === activeDepths.ids[deepestIndex]
                        ? undefined
                        : activeDepths.ids[deepestIndex],
                isClicking: false,
                activeDepths: { ids: [], depths: [] },
                activeIds: [...(prevState.activeIds || []), id],
            }));
        };

        handleHighlightMouseOver = (id: Value) => {
            this.setState((prevState) => ({
                activeIds: [...(prevState.activeIds || []), id],
            }));
        };

        handleHighlightMouseOut = () => {
            this.setState((prevState) => ({
                activeIds: (prevState.activeIds || []).filter((i) => i === this.state.selectedId),
            }));
        };

        render() {
            const { activeIds, activeDepths, isClicking, selectedId } = this.state;
            return (
                <WrappedComponent
                    {...this.props}
                    activeDepths={activeDepths}
                    activeIds={activeIds}
                    isClicking={isClicking}
                    onMouseDown={this.handleHighlightMouseDown}
                    onMouseOut={this.handleHighlightMouseOut}
                    onMouseOver={this.handleHighlightMouseOver}
                    onMouseUp={this.handleHighlightMouseUp}
                    selectedId={selectedId}
                />
            );
        }
    };
};
