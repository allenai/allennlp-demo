import React from 'react';
import { Highlight, getHighlightColor, HighlightColors } from './Highlight';
import { HighlightContainer } from './HighlightContainer';

interface Cluster {
    cluster: string;
    contents: (JSX.Element | string | Cluster | undefined)[];
    end: number;
    clusterIndex: number;
}

export const isCluster = (pred: any): pred is Cluster => {
    const typedPred = pred as Cluster;
    return (
        typedPred.cluster !== undefined &&
        typedPred.contents !== undefined &&
        typedPred.end !== undefined &&
        typedPred.clusterIndex !== undefined
    );
};

/**
 * Helper function for transforming response data into a tree object.
 *
 * @param tokens a list of strings of each of the tokens (words or punctuation) present
 * @param clusters a collection of arrays that specify spans to be clustered in the original list of tokens
 */
const transformToTree = (
    tokens: (JSX.Element | string)[],
    clusters: { [key: string]: number[][] }
) => {
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

// TODO: [jon] can we share any of these interfaces?
interface InnerProps {
    activeDepths?: { ids: (string | number)[]; depths: number[] };
    activeIds?: (string | number)[];
    data: (string | JSX.Element | Cluster | undefined)[];
    depth: number;
    isClickable?: boolean;
    isClicking?: boolean;
    labelPosition?: 'top' | 'left' | 'right' | 'bottom';
    onMouseDown?: (id: string | number, depth: number) => void;
    onMouseOut?: (id: string | number) => void;
    onMouseOver?: (id: string | number) => void;
    onMouseUp?: (id: string | number) => void;
    selectedId?: string | number;
    highlightColor?: HighlightColors | ((index: Cluster) => HighlightColors);
    tokenSeparator?: JSX.Element;
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

interface Props {
    activeDepths?: { ids: (string | number)[]; depths: number[] };
    activeIds?: (string | number)[];
    clusters: { [key: string]: number[][] }; // TODO: [jon] make a type
    isClickable?: boolean;
    isClicking?: boolean;
    labelPosition?: 'top' | 'left' | 'right' | 'bottom'; // TODO: [jon] make a type
    onMouseDown?: (id: string | number, depth: number) => void;
    onMouseOut?: (id: string | number) => void;
    onMouseOver?: (id: string | number) => void;
    onMouseUp?: (id: string | number) => void;
    selectedId?: string | number;
    tokens: (JSX.Element | string)[];
    highlightColor?: HighlightColors | ((index: Cluster) => HighlightColors);
    tokenSeparator?: JSX.Element;
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
}: Props) => {
    const data = transformToTree(tokens, clusters);
    return (
        <HighlightContainer>
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

interface HocProps extends Props {}

interface HocState {
    selectedCluster: number;
    activeIds: (string | number)[];
    activeDepths: { ids: (string | number)[]; depths: number[] };
    selectedId?: string | number;
    isClicking: boolean;
}

/**
 * An HOC that handles highlight click handling state and passes through
 * any given props.
 *
 * @param WrappedComponent Any component that requires highlight click handling
 */
export const withHighlightClickHandling = (WrappedComponent: React.ComponentType<Props>) => {
    return class _withHighlightClickHandling extends React.Component<HocProps, HocState> {
        constructor(props: Props) {
            super(props);
            this.state = {
                selectedCluster: -1,
                activeIds: [],
                activeDepths: { ids: [], depths: [] },
                isClicking: false,
            };
        }

        handleHighlightMouseDown = (id: string | number, depth: number) => {
            const depthTable = this.state.activeDepths;
            depthTable.ids.push(id);
            depthTable.depths.push(depth);

            this.setState({
                activeIds: [id],
                activeDepths: depthTable,
                isClicking: true,
            });
        };

        handleHighlightMouseUp = (id: string | number) => {
            const depthTable = this.state.activeDepths;
            const deepestIndex = depthTable.depths.indexOf(Math.max(...depthTable.depths));

            this.setState((prevState) => ({
                selectedId:
                    prevState.selectedId === depthTable.ids[deepestIndex]
                        ? undefined
                        : depthTable.ids[deepestIndex],
                isClicking: false,
                activeDepths: { ids: [], depths: [] },
                activeIds: [...prevState.activeIds, id],
            }));
        };

        handleHighlightMouseOver = (id: string | number) => {
            this.setState((prevState) => ({
                activeIds: [...prevState.activeIds, id],
            }));
        };

        handleHighlightMouseOut = () => {
            this.setState((prevState) => ({
                activeIds: prevState.activeIds.filter((i) => i === this.state.selectedId),
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
